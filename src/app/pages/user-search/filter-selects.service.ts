import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ISetupScreen } from '../../shared/interfaces/setup-screen.interface';

@Inject({})
export class FilterSelectService {
  private http = inject(HttpClient);

  public getAllSelects(userId: string, sysId: string): Observable<ISetupScreen> {
    const url = 'https://api-ext-amberchat.lcmti.com.br/setupscreen';

    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json');

    const body = {
      id_user: userId,
      id_sys: sysId
    };

    return this.http.post<ISetupScreen>(url, body, { headers });
  }
}
