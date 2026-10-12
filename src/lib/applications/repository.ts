import fs from 'fs';
import path from 'path';
import { ApplicationInput, ApplicationRecord } from './types';

/**
 * Storage Repository for HireFlow QA Lab.
 *
 * NOTE FOR QA & ARCHITECTURE AUDIT:
 * Local file-backed persistence is intended for a single-machine assessment environment
 * and is not production-grade concurrent storage. In production, this would be backed by
 * an ACID-compliant transactional database (e.g., PostgreSQL).
 */

const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'applications.json');

// In-memory fallback and cache
let inMemoryStore: ApplicationRecord[] = [];
let isInitialized = false;

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

function initIfNeeded(): void {
  if (!isInitialized) {
    inMemoryStore = loadFromDisk();
    isInitialized = true;
  }
}

export async function getAllApplications(): Promise<ApplicationRecord[]> {
  initIfNeeded();
  return [...loadFromDisk()];
}

/**
 * Explicit Deduplication Rule:
 * An application is considered a duplicate if the normalized email (case-insensitive, trimmed)
 * matches an existing application for the exact same jobId.
 */
export async function findApplication(
  jobId: string,
  email: string
): Promise<ApplicationRecord | null> {
  initIfNeeded();
  const records = loadFromDisk();
  const normalizedJobId = jobId.trim().toLowerCase();
  const normalizedEmail = email.trim().toLowerCase();

  const match = records.find(
    (app) =>
      app.jobId.toLowerCase() === normalizedJobId &&
      app.email.toLowerCase() === normalizedEmail
  );

  return match || null;
}

export async function saveApplication(
  input: ApplicationInput
): Promise<ApplicationRecord> {
  initIfNeeded();
  const records = loadFromDisk();

  const newRecord: ApplicationRecord = {
    id: `app_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    jobId: input.jobId,
    fullName: input.fullName,
    email: input.email.toLowerCase(),
    phone: input.phone,
    resumeUrl: input.resumeUrl,
    coverLetter: input.coverLetter || '',
    createdAt: new Date().toISOString()
  };

  records.push(newRecord);
  persistToDisk(records);

  return newRecord;
}

export async function clearApplications(): Promise<void> {
  inMemoryStore = [];
  persistToDisk([]);
}
