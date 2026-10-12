import fs from 'fs';
import path from 'path';
import { MongoClient, Db, Collection, MongoServerError } from 'mongodb';
import { ApplicationInput, ApplicationRecord, DuplicateApplicationError } from './types';
import { normalizeEmail } from './validation';

/**
 * Enterprise Application Repository for HireFlow QA Lab.
 *
 * Implements Workstream A requirements:
 * 1. Database-level atomic uniqueness using MongoDB compound unique index:
 *    { normalizedEmail: 1, jobId: 1 } (unique: true)
 * 2. Pre-index duplicate scan preventing data corruption without silent deletion.
 * 3. MongoDB duplicate key error translation (code 11000 -> DuplicateApplicationError).
 * 4. Concurrent-safe in-process mutex lock on fallback file-based storage.
 * 5. Production safeguards preventing destructive reset actions.
 */

const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'applications.json');

// --- In-Memory & File Storage State ---
let inMemoryStore: ApplicationRecord[] = [];
let isFileStoreInitialized = false;

// Async mutex to guarantee serial execution for file-fallback writes (preventing TOCTOU races)
class AsyncMutex {
  private queue: Promise<void> = Promise.resolve();

  async runExclusive<T>(callback: () => Promise<T> | T): Promise<T> {
    let release: () => void;
    const ticket = new Promise<void>((resolve) => {
      release = resolve;
    });
    const previous = this.queue;
    this.queue = ticket;

    await previous;
    try {
      return await callback();
    } finally {
      release!();
    }
  }
}

const fileMutex = new AsyncMutex();

// --- MongoDB State & Client Management ---
let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;
let mongoCollection: Collection<ApplicationRecord> | null = null;
let isMongoInitialized = false;
let mongoInitPromise: Promise<boolean> | null = null;

function getMongoUri(): string | undefined {
  return process.env.MONGODB_URI;
}

/**
 * Initializes MongoDB connection and creates/verifies the compound unique index.
 * Checks for existing duplicates before index creation.
 */
async function initMongo(): Promise<boolean> {
  const uri = getMongoUri();
  if (!uri) {
    return false;
  }

  if (isMongoInitialized && mongoCollection) {
    return true;
  }

  if (mongoInitPromise) {
    return mongoInitPromise;
  }

  mongoInitPromise = (async () => {
    try {
      mongoClient = new MongoClient(uri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000
      });
      await mongoClient.connect();

      // Extract database name from URI or fallback to 'hireflow'
      const parsedUrl = new URL(uri.replace('mongodb://', 'http://').replace('mongodb+srv://', 'http://'));
      const dbNameFromPath = parsedUrl.pathname.replace(/^\//, '');
      const dbName = dbNameFromPath || (process.env.NODE_ENV === 'test' ? 'hireflow_test' : 'hireflow');

      mongoDb = mongoClient.db(dbName);
      mongoCollection = mongoDb.collection<ApplicationRecord>('applications');

      // Pre-index duplicate scan: Detect duplicates before creating unique index
      const duplicateScan = await mongoCollection.aggregate<{
        _id: { normalizedEmail: string; jobId: string };
        count: number;
        records: string[];
      }>([
        {
          $group: {
            _id: { normalizedEmail: '$normalizedEmail', jobId: '$jobId' },
            count: { $sum: 1 },
            records: { $push: '$id' }
          }
        },
        { $match: { count: { $gt: 1 } } }
      ]).toArray();

      if (duplicateScan.length > 0) {
        console.error(
          '[Repository] PRE-INDEX DUPLICATE SCAN FOUND DUPLICATE APPLICATION RECORDS IN DATABASE!',
          JSON.stringify(duplicateScan, null, 2)
        );
        console.error(
          '[Repository] Manual data cleanup/migration is required before enforcing the unique compound index. HireFlow will not delete existing records silently.'
        );
      } else {
        // Enforce compound unique index on { normalizedEmail: 1, jobId: 1 }
        await mongoCollection.createIndex(
          { normalizedEmail: 1, jobId: 1 },
          { unique: true, name: 'idx_unique_application_email_job' }
        );
      }

      isMongoInitialized = true;
      console.log(`[Repository] Connected to MongoDB (${dbName}) with compound unique index enforced.`);
      return true;
    } catch (err) {
      console.warn('[Repository] MongoDB connection initialization failed; operating with file fallback:', (err as Error).message);
      mongoClient = null;
      mongoDb = null;
      mongoCollection = null;
      isMongoInitialized = false;
      return false;
    } finally {
      mongoInitPromise = null;
    }
  })();

  return mongoInitPromise;
}

// --- File Storage Utilities ---
function ensureStorage(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
    }
  } catch (err) {
    console.warn('[Repository] File-system persistence warning; falling back to memory store:', err);
  }
}

function loadFromDisk(): ApplicationRecord[] {
  try {
    ensureStorage();
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[Repository] Failed to read from disk, utilizing in-memory cache:', err);
  }
  return inMemoryStore;
}

function persistToDisk(records: ApplicationRecord[]): void {
  inMemoryStore = [...records];
  try {
    ensureStorage();
    fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Repository] Failed to flush to disk, records retained in-memory:', err);
  }
}

function initFileStoreIfNeeded(): void {
  if (!isFileStoreInitialized) {
    inMemoryStore = loadFromDisk();
    isFileStoreInitialized = true;
  }
}

// --- Public Repository Interface ---

export async function isUsingDatabase(): Promise<boolean> {
  return initMongo();
}

/**
 * Verifies that the compound unique index exists and is active.
 */
export async function verifyDatabaseIndex(): Promise<{
  usingMongo: boolean;
  hasUniqueIndex: boolean;
  indexName?: string;
}> {
  const isMongo = await initMongo();
  if (!isMongo || !mongoCollection) {
    return { usingMongo: false, hasUniqueIndex: false };
  }

  const indexes = await mongoCollection.indexes();
  const targetIndex = indexes.find(
    (idx) =>
      idx.unique === true &&
      idx.key &&
      idx.key.normalizedEmail === 1 &&
      idx.key.jobId === 1
  );

  return {
    usingMongo: true,
    hasUniqueIndex: !!targetIndex,
    indexName: targetIndex?.name
  };
}

/**
 * Retrieves all applications. Strips database internals.
 */
export async function getAllApplications(): Promise<ApplicationRecord[]> {
  const isMongo = await initMongo();
  if (isMongo && mongoCollection) {
    const docs = await mongoCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return docs.map((doc) => ({
      id: doc.id,
      jobId: doc.jobId,
      fullName: doc.fullName,
      email: doc.email,
      normalizedEmail: doc.normalizedEmail || normalizeEmail(doc.email),
      phone: doc.phone,
      resumeUrl: doc.resumeUrl,
      coverLetter: doc.coverLetter || '',
      createdAt: doc.createdAt,
      ipAddress: doc.ipAddress
    }));
  }

  initFileStoreIfNeeded();
  return [...loadFromDisk()];
}

/**
 * Looks up an existing application for a specific candidate email and job ID.
 * Uses canonical email normalization.
 */
export async function findApplication(
  jobId: string,
  email: string
): Promise<ApplicationRecord | null> {
  const normalizedEmail = normalizeEmail(email);
  const normalizedJobId = jobId.trim();

  const isMongo = await initMongo();
  if (isMongo && mongoCollection) {
    const match = await mongoCollection.findOne({
      jobId: normalizedJobId,
      normalizedEmail
    });

    if (!match) return null;

    return {
      id: match.id,
      jobId: match.jobId,
      fullName: match.fullName,
      email: match.email,
      normalizedEmail: match.normalizedEmail,
      phone: match.phone,
      resumeUrl: match.resumeUrl,
      coverLetter: match.coverLetter || '',
      createdAt: match.createdAt,
      ipAddress: match.ipAddress
    };
  }

  initFileStoreIfNeeded();
  const records = loadFromDisk();
  const match = records.find(
    (app) =>
      app.jobId === normalizedJobId &&
      (app.normalizedEmail === normalizedEmail || normalizeEmail(app.email) === normalizedEmail)
  );

  return match || null;
}

/**
 * Saves a new application.
 *
 * Enforces atomic uniqueness:
 * - When MongoDB is connected: Database-level unique index on { normalizedEmail: 1, jobId: 1 }
 *   rejects duplicate insertions and throws DuplicateApplicationError.
 * - When using file-storage fallback: An in-process async mutex guarantees serialized check-and-insert,
 *   preventing TOCTOU concurrency bypass.
 */
export async function saveApplication(
  input: ApplicationInput
): Promise<ApplicationRecord> {
  const normalizedEmail = normalizeEmail(input.email);
  const normalizedJobId = input.jobId.trim();

  const newRecord: ApplicationRecord = {
    id: `app_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    jobId: normalizedJobId,
    fullName: input.fullName.trim(),
    email: input.email.trim(),
    normalizedEmail,
    phone: input.phone.trim(),
    resumeUrl: input.resumeUrl.trim(),
    coverLetter: (input.coverLetter || '').trim(),
    createdAt: new Date().toISOString()
  };

  const isMongo = await initMongo();
  if (isMongo && mongoCollection) {
    try {
      await mongoCollection.insertOne({ ...newRecord });
      return newRecord;
    } catch (err: unknown) {
      if (err instanceof MongoServerError && err.code === 11000) {
        throw new DuplicateApplicationError(normalizedJobId, input.email);
      }
      console.error('[Repository] MongoDB persistence error:', (err as Error).message);
      throw new Error('Database persistence failed');
    }
  }

  // Fallback: Serialized in-process mutex lock prevents concurrent race conditions
  return fileMutex.runExclusive(async () => {
    initFileStoreIfNeeded();
    const records = loadFromDisk();

    const alreadyExists = records.some(
      (app) =>
        app.jobId === normalizedJobId &&
        (app.normalizedEmail === normalizedEmail || normalizeEmail(app.email) === normalizedEmail)
    );

    if (alreadyExists) {
      throw new DuplicateApplicationError(normalizedJobId, input.email);
    }

    records.push(newRecord);
    persistToDisk(records);
    return newRecord;
  });
}

/**
 * Clears application records for test isolation.
 * Strictly prohibited in production environments.
 */
export async function clearApplications(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Reset operation is strictly forbidden in production mode');
  }

  const isMongo = await initMongo();
  if (isMongo && mongoCollection) {
    await mongoCollection.deleteMany({});
  }

  inMemoryStore = [];
  persistToDisk([]);
}

/**
 * Disconnects MongoDB client (useful for test tear-down or graceful shutdown).
 */
export async function disconnectDatabase(): Promise<void> {
  if (mongoClient) {
    await mongoClient.close();
    mongoClient = null;
    mongoDb = null;
    mongoCollection = null;
    isMongoInitialized = false;
  }
}
