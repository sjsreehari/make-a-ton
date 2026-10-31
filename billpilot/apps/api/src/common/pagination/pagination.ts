import { DEFAULT_PAGINATION_LIMIT, MAX_PAGINATION_LIMIT } from '@billpilot/shared';

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationArgs {
  skip: number;
  take: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function parsePagination(params: PaginationParams): PaginationArgs {
  const page = Math.max(1, Number(params.page) || 1);
  const limit = Math.min(
    MAX_PAGINATION_LIMIT,
    Math.max(1, Number(params.limit) || DEFAULT_PAGINATION_LIMIT),
  );
  return {
    skip: (page - 1) * limit,
    take: limit,
  };
}

export function buildMeta(total: number, params: PaginationParams): PaginationMeta {
  const page = Math.max(1, Number(params.page) || 1);
  const limit = Math.min(
    MAX_PAGINATION_LIMIT,
    Math.max(1, Number(params.limit) || DEFAULT_PAGINATION_LIMIT),
  );
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  };
}
