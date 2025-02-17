import { GetUsersDTO } from './dtos/get-users.dto';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, inject } from '@angular/core';
import { IUserResponse } from '../../shared/interfaces/user-response.interface';
import { Observable } from 'rxjs';

@Inject({})
export class UserSearchService {
  private http = inject(HttpClient);

  public getUsers(data: GetUsersDTO): Observable<IUserResponse> {
    const url = 'https://api-ext-amberchat.lcmti.com.br/contacts';

    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');

    const body = {
      qr: data.filters?.query || undefined,
      canais: data.filters?.channels || undefined,
      tags: data.filters?.tags || undefined,
      page: data.pagination.page,
      page_size: data.pagination.page_size,
      status: data.filters?.status || undefined,
      usuario: data.filters?.users || undefined,
      setor: data.filters?.sectors || undefined,
      cadastro_inicial: data.filters?.register_date_range?.initial || undefined,
      cadastro_final: data.filters?.register_date_range?.final || undefined,
      atendimento_inicial:
        data.filters?.service_date_range?.initial || undefined,
      atendimento_final: data.filters?.service_date_range?.final || undefined,

      user_id: data.userId,
      sys_id: data.systemId,
    };

    return this.http.post<IUserResponse>(url, body, { headers });
  }
}
