import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, inject, OnDestroy } from '@angular/core';
import { Observable, Subject, takeUntil } from 'rxjs';
import { SalesIndicatorsStore } from '../../sales-indicators.store';

@Inject({})
export class ChatBotService implements OnDestroy {
  public systemId!: string;
  public period!: string;
  public range!: { i: string; f: string };

  private readonly unsubscribe$ = new Subject();

  private http = inject(HttpClient);
  private readonly salesIndicatorsStore = inject(SalesIndicatorsStore);

  constructor() {
    this.salesIndicatorsStore.$systemId
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe({
      next: (systemId) => {
        this.systemId = systemId;
      },
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next(true);
    this.unsubscribe$.unsubscribe();
  }

  public getMessages(contactId: string, channelId: string, page: number): Observable<any> {
    const url = 'https://api-ext-amberchat.lcmti.com.br/messages';

    const body = {
      canal: channelId,
      contact: contactId,
      sys_id: this.systemId,
      horario_referencia: new Date(),
      page: page
    };

    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');

    return this.http.post<any>(url, body, { headers });
  }
}
