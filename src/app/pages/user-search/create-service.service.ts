import { CreateServiceDTO } from './dtos/create-service.dto';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, inject } from '@angular/core';
import { Observable } from 'rxjs';

@Inject({})
export class CreateServiceService {
  private http = inject(HttpClient);

  public createService(data: CreateServiceDTO): Observable<any> {
    const url = 'https://api.amberchat.com.br/core/v2/api/chats/create-new';

    const headers = new HttpHeaders()
    .append('access-token', data.channelToken)
    .append('Content-Type', 'application/json');

    const body = {
      contactId: data.contactId,
      sectorId: data.sectorId,
      message: '',
      userId: data.userId,
    };

    return this.http.post<any>(url, body, { headers });
  }
}
