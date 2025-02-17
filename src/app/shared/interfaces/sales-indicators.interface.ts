export interface ISalesIndicators {
  filtro: string;
  totais: ISalesIndicatorsTotals;
  vendedores: ISalesIndicatorsSeller[];
  isadmin: boolean;
}

export interface ISalesIndicatorsTotals {
  total_iniciada: number;
  total_iniciada_per: number;
  total_recebida: number;
  total_recebida_per: number;
  total_msg: number;
  total_qtd_tot_contato: number;
  total_qtd_contato_erp: number;
  total_qtd_contato_erp_per: number;
  total_qtd_contato_sem_erp: number;
  total_qtd_contato_convertido: number;
  total_qtd_contato_convertido_per: number;
  total_qtd_pedido_fechado: number;
  total_fat_total: number;
}

export interface ISalesIndicatorsSeller {
  id: number;
  cod_erp: string;
  vendedor: string;
  whatsapp: number;
  token_canal: string;
  tmp: Date;
  linkImage: string;
  vendedor_id: number;
  iniciada: number;
  iniciada_per: number;
  recebida: number;
  recebida_per: number;
  qtd_tot_msg: number;
  qtd_tot_contato: number;
  qtd_contato_erp: number;
  qtd_contato_erp_per: number;
  qtd_contato_sem_erp: number;
  qtd_contato_convertido: number;
  qtd_pedido_fechado: number;
  fat_total: number;
  taxa_de_conversao: number;

  convertido_per: number;
  nao_convertido: number;
}
