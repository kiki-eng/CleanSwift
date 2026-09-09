/** Every backend response is wrapped in this envelope. */
export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  meta?: PageMetaRaw | null;
  message?: string | null;
}

/** The backend sometimes sends pagination numbers as strings. */
export interface PageMetaRaw {
  totalItems?: number | string;
  itemCount?: number | string;
  itemsPerPage?: number | string;
  totalPages?: number | string;
  currentPage?: number | string;
}

export interface PageMeta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface Paginated<T> {
  items: T[];
  meta: PageMeta | null;
  hasMore: boolean;
}

export interface ApiErrorBody {
  success: false;
  statusCode: number;
  message: string;
  error?: { message?: string };
}

export class ApiError extends Error {
  readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

const toNumber = (value: number | string | undefined): number =>
  typeof value === 'string' ? Number(value) || 0 : value ?? 0;

export function normalizeMeta(raw: PageMetaRaw | null | undefined): PageMeta | null {
  if (!raw) {
    return null;
  }
  return {
    totalItems: toNumber(raw.totalItems),
    itemCount: toNumber(raw.itemCount),
    itemsPerPage: toNumber(raw.itemsPerPage),
    totalPages: toNumber(raw.totalPages),
    currentPage: toNumber(raw.currentPage),
  };
}
