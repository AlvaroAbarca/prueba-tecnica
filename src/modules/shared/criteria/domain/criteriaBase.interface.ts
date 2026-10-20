export interface CriteriaBase {
  filter?: Record<string, any>;
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderType?: 'asc' | 'desc' | 'none';
}
