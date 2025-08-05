import { Pagination } from '../interfaces/Pagination';

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: Pagination;
} 