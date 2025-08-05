import { Filter } from './Filter';
import { Sort } from './Sort';
import { Pagination } from './Pagination';

export interface SearchParams {
  query?: string;
  filters?: Filter[];
  sort?: Sort[];
  pagination?: Pagination;
} 