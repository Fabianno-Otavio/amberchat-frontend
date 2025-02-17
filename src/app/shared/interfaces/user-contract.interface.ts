export interface IUserContractResponse {
  data: IUserContract[];
  page: number;
  page_size: number;
  total: number;
}

export interface IUserContract {
  nome: string;
  whatsapp: string;
  admin: boolean;
  ativo: boolean;
  obs: string;
  id: number;
  contratos: IContract[];
}

export interface IContract {
  cod_contrato: number;
  loja: string;
}
