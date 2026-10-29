export interface BaseDocument {
  id: string;
  createdAt: string; // ISO-8601
  updatedAt: string; // ISO-8601
}

export type QueryOperator<T> = {
  $eq?: T;
  $ne?: T;
  $in?: T[];
  $nin?: T[];
  $gt?: T;
  $gte?: T;
  $lt?: T;
  $lte?: T;
  $regex?: string | RegExp;
};

export type FilterQuery<T> = {
  [K in keyof T]?: T[K] | QueryOperator<T[K]> | ((val: T[K], doc: T) => boolean);
} & {
  $or?: FilterQuery<T>[];
  $and?: FilterQuery<T>[];
};

export interface QueryOptions<T> {
  sort?: { [K in keyof T]?: 1 | -1 | 'asc' | 'desc' };
  skip?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  skip: number;
  limit: number;
  page: number;
  totalPages: number;
}

export interface CollectionConfig {
  name: string;
  filename: string;
  uniqueIndexes?: string[];
}

export class UniqueConstraintError extends Error {
  constructor(public collection: string, public field: string, public value: any) {
    super(`Unique constraint violated on collection '${collection}': field '${field}' with value '${value}' already exists`);
    this.name = 'UniqueConstraintError';
  }
}

export class DocumentNotFoundError extends Error {
  constructor(public collection: string, public filter: any) {
    super(`Document not found in collection '${collection}' matching filter: ${JSON.stringify(filter)}`);
    this.name = 'DocumentNotFoundError';
  }
}
