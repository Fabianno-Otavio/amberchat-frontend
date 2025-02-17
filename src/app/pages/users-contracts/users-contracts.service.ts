import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, inject } from '@angular/core';
import { IUserResponse } from '../../shared/interfaces/user-response.interface';
import { Observable } from 'rxjs';
import {
  IContract,
  IUserContract,
  IUserContractResponse,
} from '../../shared/interfaces/user-contract.interface';

@Inject({})
export class UsersContractsService {
  private http = inject(HttpClient);

  public getUsers(data: {
    query?: string;
    page?: number;
    page_size?: number;
  }): Observable<IUserContractResponse> {
    let url = 'https://api-chatbot-shopping.lcmti.com.br/usuario?';

    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');

    if (data.query) {
      url += `qr=${data.query}`;
    }

    if (data.page) {
      url += `page=${data.page}`;
    }

    if (data.page_size) {
      url += `page_size=${data.page_size}`;
    }

    return this.http.get<IUserContractResponse>(url, { headers });
  }

  public getContracts(query: string): Observable<IContract[]> {
    let url = 'https://api-chatbot-shopping.lcmti.com.br/contrato?';

    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');

    if (query) {
      url += `qr=${query}`;
    }

    return this.http.get<IContract[]>(url, { headers });
  }

  public getUserById(userId: number): Observable<any> {
    const url = `https://api-chatbot-shopping.lcmti.com.br/usuario/${userId}`;

    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');

    return this.http.get(url, { headers });
  }

  public createUser(user: IUserContract): Observable<any> {
    const url = `https://api-chatbot-shopping.lcmti.com.br/usuario`;

    if (!user.contratos) user.contratos = [];

    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');

    return this.http.post(url, user, { headers });
  }

  public updateUser(user: IUserContract): Observable<any> {
    const url = `https://api-chatbot-shopping.lcmti.com.br/usuario/${user.id}`;

    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');

    return this.http.put(url, user, { headers });
  }

  public deleteUser(userId: number): Observable<any> {
    const url = `https://api-chatbot-shopping.lcmti.com.br/usuario/${userId}`;

    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');

    return this.http.delete(url, { headers });
  }
}
