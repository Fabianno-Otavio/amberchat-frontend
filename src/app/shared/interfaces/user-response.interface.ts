export interface IUserResponse {
  data: IUserData[];
  message: string;
  nextpg: number;
  pg: number;
  pgsize: number;
  total_items: number;
  success: boolean;
}

export interface IUserData {
  id: string;
  json_contato: IUserDataDetail;
  json_atendimento: IAtendimentoDetail[];
  number: string;
  displayName?: string;
  isOnAtendimento?: boolean;
}

export interface IUserDataDetail {
  dhRegister: string;
  genericAttributes: any[];
  hasInteraction: boolean;
  id: string;
  linkImage: string;
  name: string;
  nameFromWhatsApp: string;
  number: string;
  onlyScriptEvent: boolean;
  organizations: string[];
  nickName?: string;
  tags: ITagDetail[];
}

export interface IAtendimentoDetail {
  type: number;
  hasTag: boolean;
  origen: number;
  status: number;
  channel: {
    id: string;
    type: number;
    identifier: string;
    description: string;
  };
  contact: {
    id: string;
    isMe: boolean;
    name: string;
    tags: [];
    number: string;
    linkImage: string;
    secondaryName: string;
  };
  currentSector?: {
    id: string;
    description: string;
  },
  currentUser?: {
    id: string;
    name: string;
  },
  linkImage: string;
  description: string;
  attendanceId: string;
  currentOrganization: {
    id: string;
    description: string;
  };
}

export interface ITagDetail {
  Description: string;
  HexColor: string;
  Id: string;
  OrganizationId: string;
}
