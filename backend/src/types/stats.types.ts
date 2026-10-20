export interface StatsResponse {
  totals: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
}
