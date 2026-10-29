import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  BaseDocument,
  FilterQuery,
  QueryOptions,
  PaginatedResult,
  UniqueConstraintError,
  DocumentNotFoundError,
} from './types.js';

export interface DocumentStoreOptions {
  dataDir?: string;
  uniqueIndexes?: Record<string, string[]>; // collectionName -> unique fields
}

/**
 * In-memory mutex/queue per collection to serialize writes and avoid race conditions
 */
class WriteQueue {
  private queue: Promise<any> = Promise.resolve();

  enqueue<T>(task: () => Promise<T>): Promise<T> {
    const next = this.queue.then(task, task);
    this.queue = next.then(() => {}, () => {});
    return next;
  }
}

export class DocumentStore {
  private dataDir: string;
  private queues: Map<string, WriteQueue> = new Map();
  private uniqueIndexes: Record<string, string[]>;
  private cache: Map<string, BaseDocument[]> = new Map();
  private initialized: boolean = false;

  constructor(options: DocumentStoreOptions = {}) {
    this.dataDir = options.dataDir || path.resolve(process.cwd(), '../data');
    this.uniqueIndexes = options.uniqueIndexes || {};
  }

  public getFilePath(collectionName: string): string {
    return path.join(this.dataDir, `${collectionName}.json`);
  }

  private getQueue(collectionName: string): WriteQueue {
    if (!this.queues.has(collectionName)) {
      this.queues.set(collectionName, new WriteQueue());
    }
    return this.queues.get(collectionName)!;
  }

  /**
   * Initializes the database directory and safe default empty collections
   */
  public async init(knownCollections: string[] = []): Promise<void> {
    if (!fs.existsSync(this.dataDir)) {
      await fs.promises.mkdir(this.dataDir, { recursive: true });
    }

    for (const coll of knownCollections) {
      const filePath = this.getFilePath(coll);
      if (!fs.existsSync(filePath)) {
        await this.writeAtomic(filePath, []);
      }
    }

    this.initialized = true;
  }

  /**
   * Safe read with corruption detection and recovery
   */
  private async readCollection<T extends BaseDocument>(collectionName: string): Promise<T[]> {
    const filePath = this.getFilePath(collectionName);

    if (!fs.existsSync(filePath)) {
      if (!fs.existsSync(this.dataDir)) {
        await fs.promises.mkdir(this.dataDir, { recursive: true });
      }
      await this.writeAtomic(filePath, []);
      return [];
    }

    try {
      const raw = await fs.promises.readFile(filePath, 'utf-8');
      if (!raw || raw.trim() === '') {
        return [];
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        throw new Error(`Data in ${collectionName}.json is not an array`);
      }
      return parsed as T[];
    } catch (err: any) {
      console.error(`[DocumentStore Error] Corrupted JSON detected in ${collectionName}: ${err.message}`);
      // Preserve corrupted file for forensics
      const corruptBackup = `${filePath}.corrupt.${Date.now()}`;
      try {
        await fs.promises.rename(filePath, corruptBackup);
        console.warn(`[DocumentStore Recovery] Preserved corrupted file at ${corruptBackup}. Initializing fresh store.`);
      } catch (renameErr) {
        console.error(`[DocumentStore Recovery] Failed to preserve corrupted file:`, renameErr);
      }
      // Re-initialize with safe empty array
      await this.writeAtomic(filePath, []);
      return [];
    }
  }

  /**
   * Atomic file persistence using temporary file and atomic rename,
   * with Windows EPERM/EBUSY retry and copyFile fallback.
   */
  private async writeAtomic(filePath: string, data: any[]): Promise<void> {
    const parentDir = path.dirname(filePath);
    if (!fs.existsSync(parentDir)) {
      await fs.promises.mkdir(parentDir, { recursive: true });
    }

    const tempFile = `${filePath}.tmp.${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const serialized = JSON.stringify(data, null, 2);

    await fs.promises.writeFile(tempFile, serialized, 'utf-8');

    let retries = 6;
    while (retries > 0) {
      try {
        await fs.promises.rename(tempFile, filePath);
        return;
      } catch (err: any) {
        if ((err.code === 'EPERM' || err.code === 'EBUSY' || err.code === 'EACCES') && retries > 1) {
          retries--;
          await new Promise((resolve) => setTimeout(resolve, 30));
        } else if (retries <= 1) {
          try {
            await fs.promises.copyFile(tempFile, filePath);
            await fs.promises.unlink(tempFile).catch(() => {});
            return;
          } catch (copyErr) {
            throw err;
          }
        } else {
          throw err;
        }
      }
    }
  }

  /**
   * Generate collision-resistant unique ID
   */
  public generateId(prefix: string = 'doc'): string {
    const timePart = Date.now().toString(36);
    const randPart = crypto.randomBytes(6).toString('hex');
    return `${prefix}_${timePart}${randPart}`;
  }

  /**
   * Check unique index constraints
   */
  private checkUniqueConstraints<T extends BaseDocument>(
    collectionName: string,
    docs: T[],
    candidate: Partial<T>,
    excludeId?: string
  ): void {
    const uniqueFields = this.uniqueIndexes[collectionName] || [];
    for (const field of uniqueFields) {
      const candidateValue = (candidate as any)[field];
      if (candidateValue !== undefined && candidateValue !== null) {
        const duplicate = docs.find(
          (doc) => (doc as any)[field] === candidateValue && doc.id !== excludeId
        );
        if (duplicate) {
          throw new UniqueConstraintError(collectionName, field, candidateValue);
        }
      }
    }
  }

  /**
   * Evaluates if a document matches a single condition or operator
   */
  private matchCondition(actual: any, expected: any, doc: any): boolean {
    if (typeof expected === 'function') {
      return expected(actual, doc);
    }
    if (expected === null || expected === undefined || typeof expected !== 'object' || expected instanceof Date || expected instanceof RegExp) {
      return actual === expected;
    }

    // Check operators
    let isMatch = true;
    for (const op of Object.keys(expected)) {
      const opValue = expected[op];
      switch (op) {
        case '$eq':
          if (actual !== opValue) isMatch = false;
          break;
        case '$ne':
          if (actual === opValue) isMatch = false;
          break;
        case '$gt':
          if (!(actual > opValue)) isMatch = false;
          break;
        case '$gte':
          if (!(actual >= opValue)) isMatch = false;
          break;
        case '$lt':
          if (!(actual < opValue)) isMatch = false;
          break;
        case '$lte':
          if (!(actual <= opValue)) isMatch = false;
          break;
        case '$in':
          if (!Array.isArray(opValue) || !opValue.includes(actual)) isMatch = false;
          break;
        case '$nin':
          if (Array.isArray(opValue) && opValue.includes(actual)) isMatch = false;
          break;
        case '$regex':
          const regex = typeof opValue === 'string' ? new RegExp(opValue, 'i') : opValue;
          if (!regex.test(String(actual || ''))) isMatch = false;
          break;
        default:
          if (actual !== expected) isMatch = false;
          break;
      }
      if (!isMatch) break;
    }
    return isMatch;
  }

  /**
   * Evaluates a document against a filter query
   */
  public matchFilter<T extends BaseDocument>(doc: T, filter: FilterQuery<T>): boolean {
    if (!filter || Object.keys(filter).length === 0) return true;

    // Handle $or
    if (filter.$or && Array.isArray(filter.$or)) {
      const orMatched = filter.$or.some((subFilter) => this.matchFilter(doc, subFilter));
      if (!orMatched) return false;
    }

    // Handle $and
    if (filter.$and && Array.isArray(filter.$and)) {
      const andMatched = filter.$and.every((subFilter) => this.matchFilter(doc, subFilter));
      if (!andMatched) return false;
    }

    // Handle standard keys
    for (const key of Object.keys(filter)) {
      if (key === '$or' || key === '$and') continue;
      const expected = (filter as any)[key];
      const actual = (doc as any)[key];
      if (!this.matchCondition(actual, expected, doc)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Insert a new document
   */
  public async insertOne<T extends BaseDocument>(
    collectionName: string,
    docData: Omit<T, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
    prefix: string = 'doc'
  ): Promise<T> {
    return this.getQueue(collectionName).enqueue(async () => {
      const docs = await this.readCollection<T>(collectionName);
      const now = new Date().toISOString();
      const id = docData.id || this.generateId(prefix);

      const newDoc: T = {
        ...docData,
        id,
        createdAt: now,
        updatedAt: now,
      } as T;

      this.checkUniqueConstraints(collectionName, docs, newDoc);

      docs.push(newDoc);
      await this.writeAtomic(this.getFilePath(collectionName), docs);
      return newDoc;
    });
  }

  /**
   * Find a single document matching the filter
   */
  public async findOne<T extends BaseDocument>(
    collectionName: string,
    filter: FilterQuery<T>
  ): Promise<T | null> {
    const docs = await this.readCollection<T>(collectionName);
    const found = docs.find((doc) => this.matchFilter(doc, filter));
    return found ? { ...found } : null;
  }

  /**
   * Find multiple documents matching filter with sorting and pagination
   */
  public async findMany<T extends BaseDocument>(
    collectionName: string,
    filter: FilterQuery<T> = {},
    options: QueryOptions<T> = {}
  ): Promise<T[]> {
    let docs = await this.readCollection<T>(collectionName);

    // Filter
    if (filter && Object.keys(filter).length > 0) {
      docs = docs.filter((doc) => this.matchFilter(doc, filter));
    }

    // Sort
    if (options.sort) {
      const sortKeys = Object.keys(options.sort) as (keyof T)[];
      docs.sort((a, b) => {
        for (const key of sortKeys) {
          const order = options.sort![key];
          const isAsc = order === 1 || order === 'asc';
          const aVal = a[key];
          const bVal = b[key];
          if (aVal < bVal) return isAsc ? -1 : 1;
          if (aVal > bVal) return isAsc ? 1 : -1;
        }
        return 0;
      });
    }

    // Skip
    if (options.skip && options.skip > 0) {
      docs = docs.slice(options.skip);
    }

    // Limit
    if (options.limit && options.limit > 0) {
      docs = docs.slice(0, options.limit);
    }

    return docs.map((d) => ({ ...d }));
  }

  /**
   * Paginated findMany returning metadata
   */
  public async findPaginated<T extends BaseDocument>(
    collectionName: string,
    filter: FilterQuery<T> = {},
    page: number = 1,
    limit: number = 20,
    sort?: QueryOptions<T>['sort']
  ): Promise<PaginatedResult<T>> {
    const allDocs = await this.readCollection<T>(collectionName);
    const filtered = allDocs.filter((doc) => this.matchFilter(doc, filter));
    const total = filtered.length;

    // Sort
    if (sort) {
      const sortKeys = Object.keys(sort) as (keyof T)[];
      filtered.sort((a, b) => {
        for (const key of sortKeys) {
          const order = sort[key];
          const isAsc = order === 1 || order === 'asc';
          const aVal = a[key];
          const bVal = b[key];
          if (aVal < bVal) return isAsc ? -1 : 1;
          if (aVal > bVal) return isAsc ? 1 : -1;
        }
        return 0;
      });
    }

    const validPage = Math.max(1, page);
    const validLimit = Math.max(1, limit);
    const skip = (validPage - 1) * validLimit;
    const data = filtered.slice(skip, skip + validLimit).map((d) => ({ ...d }));
    const totalPages = Math.ceil(total / validLimit);

    return {
      data,
      total,
      skip,
      limit: validLimit,
      page: validPage,
      totalPages,
    };
  }

  /**
   * Update one document
   */
  public async updateOne<T extends BaseDocument>(
    collectionName: string,
    filter: FilterQuery<T>,
    update: Partial<T> | ((doc: T) => Partial<T>)
  ): Promise<T | null> {
    return this.getQueue(collectionName).enqueue(async () => {
      const docs = await this.readCollection<T>(collectionName);
      const index = docs.findIndex((doc) => this.matchFilter(doc, filter));
      if (index === -1) {
        return null;
      }

      const existing = docs[index];
      const updates = typeof update === 'function' ? update(existing) : update;

      const updatedDoc: T = {
        ...existing,
        ...updates,
        id: existing.id, // Never allow changing document ID
        createdAt: existing.createdAt, // Preserve creation timestamp
        updatedAt: new Date().toISOString(),
      };

      this.checkUniqueConstraints(collectionName, docs, updatedDoc, existing.id);

      docs[index] = updatedDoc;
      await this.writeAtomic(this.getFilePath(collectionName), docs);
      return { ...updatedDoc };
    });
  }

  /**
   * Delete one document
   */
  public async deleteOne<T extends BaseDocument>(
    collectionName: string,
    filter: FilterQuery<T>
  ): Promise<boolean> {
    return this.getQueue(collectionName).enqueue(async () => {
      const docs = await this.readCollection<T>(collectionName);
      const index = docs.findIndex((doc) => this.matchFilter(doc, filter));
      if (index === -1) {
        return false;
      }

      docs.splice(index, 1);
      await this.writeAtomic(this.getFilePath(collectionName), docs);
      return true;
    });
  }

  /**
   * Count documents matching filter
   */
  public async countDocuments<T extends BaseDocument>(
    collectionName: string,
    filter: FilterQuery<T> = {}
  ): Promise<number> {
    const docs = await this.readCollection<T>(collectionName);
    if (!filter || Object.keys(filter).length === 0) {
      return docs.length;
    }
    return docs.filter((doc) => this.matchFilter(doc, filter)).length;
  }

  /**
   * Flexible aggregation helper
   */
  public async aggregate<T extends BaseDocument, R>(
    collectionName: string,
    pipeline: (docs: T[]) => R
  ): Promise<R> {
    const docs = await this.readCollection<T>(collectionName);
    return pipeline(docs.map((d) => ({ ...d })));
  }

  /**
   * Direct overwrite of collection (used for seed/restore)
   */
  public async replaceCollection<T extends BaseDocument>(
    collectionName: string,
    docs: T[]
  ): Promise<void> {
    return this.getQueue(collectionName).enqueue(async () => {
      await this.writeAtomic(this.getFilePath(collectionName), docs);
    });
  }
}
