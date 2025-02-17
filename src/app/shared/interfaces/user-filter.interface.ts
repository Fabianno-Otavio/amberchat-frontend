export interface IUserFilter {
  query?: string;
  channels?: string;
  tags?: string;
  status?: string;
  users?: string;
  sectors?: string;
  register_date_range?: {
    initial: string;
    final: string;
  };
  service_date_range?: {
    initial: string;
    final: string;
  };
}
