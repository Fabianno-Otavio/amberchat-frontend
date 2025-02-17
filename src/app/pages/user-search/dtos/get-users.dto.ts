import { IUserFilter } from '../../../shared/interfaces/user-filter.interface';

export type GetUsersDTO = {
  userId: string;
  systemId: string;
  pagination: { page: number; page_size: number };
  filters?: IUserFilter;
};
