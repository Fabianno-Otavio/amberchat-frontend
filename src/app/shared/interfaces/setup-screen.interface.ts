export interface ISetupScreen {
  channels: ISSChannel[];
  sectors: ISSSector[];
  organization: ISSOrganization[];
  tags: ISSTag[];
  users: ISSUSer[];
}

export interface ISSChannel {
  nome_canal: string;
  token: string;
  whatsapp: string;
  organizationid: string;
}

export interface ISSOrganization {
  description: string;
  id: string;
  link_image: string;
  time_zone: string;
}

export interface ISSSector {
  id: string;
  name: string;
  organizationId: string;
}

export interface ISSTag {
  description: string;
  id: string;
  hexcolor: string;
  organizationid: string;
}

export interface ISSUSer {
  id: string;
  name: string;
  nickname: string;
}
