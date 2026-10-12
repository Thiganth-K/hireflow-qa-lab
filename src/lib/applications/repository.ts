import fs from 'fs';
import path from 'path';
import { MongoClient, Db, Collection, MongoServerError } from 'mongodb';
import {
  ApplicationInput,
  ApplicationRecord,
  DuplicateApplicationError,
  DatabaseUnavailableError
} from './types';
import { normalizeEmail } from './validation';

/**
 * Enterprise Application Repository for HireFlow QA Lab.
 *
 * Implements Phase 1 & Phase 2 Persistence Architecture:
 * 1. Database-level atomic uniqueness using MongoDB compound unique index:
 *    { normalizedEmail: 1, jobId: 1 } (unique: true).
 * 2. Strict backend selection: When MONGODB_URI is configured, MongoDB is the
 *    SOUL source of truth. Unavailability throws DatabaseUnavailableError;
 *    silent fallback to JSON is strictly prohibited (eliminates split-brain, AUD-P2-02).
 * 3. Atomic crash-resistant JSON file replacement using temporary files, fsync,
 *    and verified cross-platform replace (AUD-P2-03).
 * 4. In-process AsyncMutex lock restricting file-based persistence to single-process
 *    local development. MongoDB is required for multi-process/production (AUD-P2-04).
 * 5. Production safeguards preventing destructive reset actions or insecure fallbacks.
 */

const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'applications.json');

// --- In-Memory & File Storage State ---
// Concurrency Boundaries (AUD-P2-04):
// The AsyncMutex operates strictly in-memory within a single Node.js process.
// It CANNOT serialize concurrent requests across multiple worker processes or containers.
// Therefore, file-based persistence is strictly reserved for single-process local development.
let inMemoryStore: ApplicationRecord[] = [];
let isFileStoreInitialized = false;

// Async mutex to guarantee serial execution for file writes within a single process
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
let mongoInitPromise: Promise<Collection<ApplicationRecord>> | null = null;

export function isMongoConfigured(): boolean {
  const uri = process.env.MONGODB_URI;
  return typeof uri === 'string' && uri.trim().length > 0;
}

function getMongoUri(): string | undefined {
  return process.env.MONGODB_URI;
}

/**
 * Validates that file-based storage is not being used in production.
 */
function assertDeploymentBackendAllowed(): void {
  if (process.env.NODE_ENV === 'production' && !isMongoConfigured()) {
    throw new Error(
      'Production deployments require a configured MongoDB connection (MONGODB_URI). ' +
      'File-based persistence is restricted to single-process local development.'
    );
  }
}

/**
 * Initializes MongoDB connection and creates/verifies the compound unique index.
 * Throws DatabaseUnavailableError when connection fails or database is unreachable.
 * Never falls back to file storage when MONGODB_URI is configured.
 */
async function initMongo(): Promise<Collection<ApplicationRecord>> {
  const uri = getMongoUri();
  if (!uri || uri.trim().length === 0) {
    throw new DatabaseUnavailableError('MongoDB is not configured');
  }

  if (isMongoInitialized && mongoCollection) {
    return mongoCollection;
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
      return mongoCollection;
    } catch (err) {
      console.error('[Repository] MongoDB connection initialization failed:', (err as Error).message);
      if (mongoClient) {
        try {
          await mongoClient.close();
        } catch {
          // ignore
        }
      }
      mongoClient = null;
      mongoDb = null;
      mongoCollection = null;
      isMongoInitialized = false;
      throw new DatabaseUnavailableError('Database service is currently unavailable. Please retry later.');
    } finally {
      mongoInitPromise = null;
    }
  })();

  return mongoInitPromise;
}

// --- File Storage Utilities (Single-Process Local Mode Only) ---

function ensureStorage(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('[Repository] File-system persistence directory initialization error:', err);
    throw new Error('Failed to initialize local data directory');
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

/**
 * Persists application records to disk using crash-resilient atomic file replacement.
 *
 * Resilience Strategy (AUD-P2-03):
 * 1. Serializes records to a unique temporary file (.applications.<timestamp>.<rand>.tmp)
 *    in the same directory to ensure same-filesystem atomic rename.
 * 2. Flushes buffers using fsync to ensure data is committed to disk before replacing target.
 * 3. Explicitly closes the temporary file descriptor before replacement (critical for Windows).
 * 4. Atomically replaces target applications.json.
 * 5. Cleans up temporary files in error paths.
 * 6. Updates in-memory store ONLY after successful durable disk commit.
 *
 * Concurrency & Scope Note (AUD-P2-04):
 * This persistence mode relies on in-process AsyncMutex and is strictly intended
 * for single-process local development. Multi-process/production requires MongoDB.
 * Note: Atomic replacement provides crash resilience against process crashes;
 * it cannot guarantee integrity against sudden hardware power failure or underlying filesystem corruption.
 */
function persistToDisk(records: ApplicationRecord[]): void {
  ensureStorage();
  const serialized = JSON.stringify(records, null, 2);
  const tempFile = path.join(
    DATA_DIR,
    `.applications.${Date.now()}.${Math.random().toString(36).substring(2, 8)}.tmp`
  );

  let fd: number | null = null;
  try {
    // 1. Write to temporary file in the same directory
    fd = fs.openSync(tempFile, 'w');
    fs.writeFileSync(fd, serialized, 'utf-8');

    // 2. Flush to disk where supported
    try {
      fs.fsyncSync(fd);
    } catch {
      // fsync may be unsupported on some virtual filesystems; continue safely
    }

    // 3. Close descriptor before replacing target (required on Windows)
    fs.closeSync(fd);
    fd = null;

    // 4. Atomically replace target file
    try {
      fs.renameSync(tempFile, DATA_FILE);
    } catch (renameErr) {
      // Windows fallback if rename cannot atomically overwrite an existing open handle
      if (fs.existsSync(DATA_FILE)) {
        const backupFile = `${DATA_FILE}.bak`;
        try {
          if (fs.existsSync(backupFile)) fs.unlinkSync(backupFile);
          fs.renameSync(DATA_FILE, backupFile);
          fs.renameSync(tempFile, DATA_FILE);
          if (fs.existsSync(backupFile)) fs.unlinkSync(backupFile);
        } catch {
          throw renameErr;
        }
      } else {
        throw renameErr;
      }
    }

    // 5. Update in-memory cache ONLY after durable disk flush succeeded
    inMemoryStore = [...records];
  } catch (err) {
    if (fd !== null) {
      try {
        fs.closeSync(fd);
      } catch {
        // ignore
      }
    }
    if (fs.existsSync(tempFile)) {
      try {
        fs.unlinkSync(tempFile);
      } catch {
        // ignore
      }
    }
    console.error('[Repository] Failed to atomically persist records to disk:', err);
    throw new Error('Durable persistence failed: unable to safely write application records to disk.');
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
  if (!isMongoConfigured()) return false;
  try {
    await initMongo();
    return true;
  } catch {
    return false;
  }
}

/**
 * Verifies that the compound unique index exists and is active.
 */
export async function verifyDatabaseIndex(): Promise<{
  usingMongo: boolean;
  hasUniqueIndex: boolean;
  indexName?: string;
}> {
  if (!isMongoConfigured()) {
    return { usingMongo: false, hasUniqueIndex: false };
  }

  const collection = await initMongo();
  const indexes = await collection.indexes();
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
 * When MONGODB_URI is configured, reads strictly from MongoDB; never falls back to JSON.
 */
export async function getAllApplications(): Promise<ApplicationRecord[]> {
  if (isMongoConfigured()) {
    const collection = await initMongo();
    try {
      const docs = await collection
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
    } catch (err: unknown) {
      if (err instanceof DatabaseUnavailableError) throw err;
      console.error('[Repository] MongoDB query error:', (err as Error).message);
      isMongoInitialized = false;
      mongoCollection = null;
      throw new DatabaseUnavailableError('Database service is currently unavailable. Please retry later.');
    }
  }

  assertDeploymentBackendAllowed();
  initFileStoreIfNeeded();
  return [...loadFromDisk()];
}

/**
 * Looks up an existing application for a specific candidate email and job ID.
 * When MONGODB_URI is configured, reads strictly from MongoDB; never falls back to JSON.
 */
export async function findApplication(
  jobId: string,
  email: string
): Promise<ApplicationRecord | null> {
  const normalizedEmail = normalizeEmail(email);
  const normalizedJobId = jobId.trim();

  if (isMongoConfigured()) {
    const collection = await initMongo();
    try {
      const match = await collection.findOne({
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
    } catch (err: unknown) {
      if (err instanceof DatabaseUnavailableError) throw err;
      console.error('[Repository] MongoDB find error:', (err as Error).message);
      isMongoInitialized = false;
      mongoCollection = null;
      throw new DatabaseUnavailableError('Database service is currently unavailable. Please retry later.');
    }
  }

  assertDeploymentBackendAllowed();
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
 * Persistence Selection:
 * - When MONGODB_URI is configured: MongoDB is the SOLE persistence engine.
 *   Database-level unique index on { normalizedEmail: 1, jobId: 1 } enforces uniqueness.
 *   If MongoDB is unreachable, DatabaseUnavailableError is thrown (no JSON fallback).
 * - When MONGODB_URI is absent: Single-process local JSON persistence is used.
 *   Serialized in-process AsyncMutex prevents concurrent races.
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

  if (isMongoConfigured()) {
    const collection = await initMongo();
    try {
      await collection.insertOne({ ...newRecord });
      return newRecord;
    } catch (err: unknown) {
      if (err instanceof MongoServerError && err.code === 11000) {
        throw new DuplicateApplicationError(normalizedJobId, input.email);
      }
      if (err instanceof DatabaseUnavailableError) {
        throw err;
      }
      console.error('[Repository] MongoDB persistence error:', (err as Error).message);
      isMongoInitialized = false;
      mongoCollection = null;
      throw new DatabaseUnavailableError('Database service is currently unavailable. Please retry later.');
    }
  }

  // Fallback: Serialized in-process mutex lock prevents concurrent race conditions
  // Strictly permitted only in single-process local/offline mode.
  assertDeploymentBackendAllowed();
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

    const updatedRecords = [...records, newRecord];
    persistToDisk(updatedRecords);
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

  if (isMongoConfigured()) {
    const collection = await initMongo();
    try {
      await collection.deleteMany({});
      return;
    } catch (err: unknown) {
      if (err instanceof DatabaseUnavailableError) throw err;
      console.error('[Repository] MongoDB clear error:', (err as Error).message);
      isMongoInitialized = false;
      mongoCollection = null;
      throw new DatabaseUnavailableError('Database service is currently unavailable. Please retry later.');
    }
  }

  assertDeploymentBackendAllowed();
  await fileMutex.runExclusive(async () => {
    persistToDisk([]);
    inMemoryStore = [];
  });
}

/**
 * Disconnects MongoDB client (useful for test tear-down, recovery testing, or graceful shutdown).
 */
export async function disconnectDatabase(): Promise<void> {
  mongoInitPromise = null;
  if (mongoClient) {
    try {
      await mongoClient.close();
    } catch (err) {
      console.warn('[Repository] Error closing MongoDB client:', (err as Error).message);
    } finally {
      mongoClient = null;
      mongoDb = null;
      mongoCollection = null;
      isMongoInitialized = false;
    }
  }
}

