import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, inject, OnDestroy, OnInit } from '@angular/core';
import { ISalesIndicators } from '../../shared/interfaces/sales-indicators.interface';
import { Observable, Subject, takeUntil } from 'rxjs';
import { SalesIndicatorsStore } from './sales-indicators.store';

export enum SALES_INDICATOR_PERIOD {
  LAST_YEAR = 'lastYear',
  THIS_YEAR = 'thisYear',
  PREVIOUS_MONTH = 'previousMonth',
  CURRENT_MONTH = 'currentMonth',
  TODAY = 'today',
  CUSTOM = 'custom',
}

@Inject({})
export class SalesIndicatorsService implements OnDestroy {
  private http = inject(HttpClient);
  private readonly salesIndicatorsStore = inject(SalesIndicatorsStore);

  public systemId!: string;
  public userId!: string;
  public period!: string;
  public range!: { i: string; f: string };
  public organizations!: string[];

  private readonly unsubscribe$ = new Subject();

  constructor() {
    this.salesIndicatorsStore.$systemId
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (systemId) => {
          this.systemId = systemId;
        },
      });

    this.salesIndicatorsStore.$userId
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (userId) => {
          this.userId = userId;
        },
      });

    this.salesIndicatorsStore.$period
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (period) => {
          this.period = period;
        },
      });

    this.salesIndicatorsStore.$customPeriodRange
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (customRange) => {
          this.range = customRange;
        },
      });

    this.salesIndicatorsStore.$organizations
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (organizations) => {
          this.organizations = organizations as string[];
        },
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next(true);
    this.unsubscribe$.unsubscribe();
  }

  public getSalesIndicators(
    sellerId: string | number = 0,
  ): Observable<ISalesIndicators> {
    const url = 'https://api-ext-amberchat.lcmti.com.br/dv/totais';

    const body = {
      query: '',
      ordem_listagem: 'faturamento_total',
      direcao_listagem: 'asc',
      vendedor_id: sellerId,
      period: this.period,
      period_ini: this.range?.i || '',
      period_fim: this.range?.f || '',
      tipo_planilha: 'canais',
      idsystem: this.systemId,
      iduser: this.userId,
      organizations: this.organizations,
    };

    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');

    return this.http.post<ISalesIndicators>(url, body, { headers });
  }

  public getAllSellersContacts(
    query?: string,
    page?: number,
    sellerId: string | number = 0,
    sort?: { column: string; direction: string | null },
    pageSize: number = 100,
  ): Observable<any> {
    const url = 'https://api-ext-amberchat.lcmti.com.br/dv/contatos';

    const body = {
      query: query || '',
      ordem_listagem: sort?.column,
      direcao_listagem: sort?.direction,
      vendedor_id: sellerId,
      period: this.period,
      period_ini: this.range?.i || '',
      period_fim: this.range?.f || '',
      tipo_planilha: 'canais',
      idsystem: this.systemId,
      iduser: this.userId,
      page: page,
      page_size: pageSize,
    };

    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');

    return this.http.post<any>(url, body, { headers });
  }

  public getOrganizations() {
    const url = 'https://api-ext-amberchat.lcmti.com.br/organizations';

    const body = {
      id_user: this.userId,
      id_sys: this.systemId,
    };

    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');

    return this.http.post<any>(url, body, { headers });
  }

  public getSetupAdmin() {
    const url = 'https://api-ext-amberchat.lcmti.com.br/dv/setupadminperm';

    const body = {
      id_user: this.userId,
      id_sys: this.systemId,
    };

    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');

    return this.http.post<any>(url, body, { headers });
  }

  public getPermissions() {
    const url = 'https://api-ext-amberchat.lcmti.com.br/dv/perms/getperms';

    const body = {
      id_user: this.userId,
      id_sys: this.systemId,
    };

    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');

    return this.http.post<any>(url, body, { headers });
  }

  public setPermissions(userPermissions: any) {
    const url = 'https://api-ext-amberchat.lcmti.com.br/dv/perms/setperms';

    const body = {
      idsystem: this.systemId,
      iduser: this.userId,
      users: userPermissions
    };

    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');

    return this.http.post<any>(url, body, { headers });
  }
}
