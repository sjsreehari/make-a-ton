import { z } from 'zod';
import { MAX_PAGINATION_LIMIT, DEFAULT_PAGINATION_LIMIT } from '../constants.js';

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(MAX_PAGINATION_LIMIT).default(DEFAULT_PAGINATION_LIMIT),
  sort: z.string().optional(),
  cursor: z.string().optional(),
});
export type PaginationInput = z.infer<typeof paginationSchema>;

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface CursorPaginatedResponse<T> {
  data: T[];
  nextCursor?: string;
  hasMore: boolean;
}

