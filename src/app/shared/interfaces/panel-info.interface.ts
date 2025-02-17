import { ISSChannel, ISSOrganization, ISSUSer } from './setup-screen.interface';

export interface IPanelInfo {
  success: boolean;
  channels: ISSChannel[];
  organization: ISSOrganization[];
  users: ISSUSer[];
}
