import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { UserStore } from './user.store';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

@Injectable({
  providedIn: 'root',
})
export class KanbanService {
  private http = inject(HttpClient);
  private userStore = inject(UserStore);

  private systemId!: string;
  private userId!: string;
  private socket$!: WebSocketSubject<any>;

  constructor() {
    this.userStore.$systemId.subscribe({
      next: (systemId) => {
        this.systemId = systemId;
      },
    });

    this.userStore.$userId.subscribe({
      next: (userId) => {
        this.userId = userId;
      },
    });
  }

  public setupScreen(): Observable<any> {
    const url = 'https://api-ext-amberchat.lcmti.com.br/kb/startinginfo';

    const headers = new HttpHeaders().append(
      'Content-Type',
      'application/json',
    );

    const body = {
      user_id: this.userId,
      sys_id: this.systemId,
    };

    return this.http.post<any>(url, body, { headers });
  }

  public getFunnel(data: any): Observable<any> {
    const url = 'https://api-ext-amberchat.lcmti.com.br/kb/funnelinfo';

    const headers = new HttpHeaders().append(
      'Content-Type',
      'application/json',
    );

    const body = {
      user_id: this.userId,
      sys_id: this.systemId,
      funnel_id: data.funnelId,
    };

    return this.http.post<any>(url, body, { headers });
  }

  public createFunnel(data: any, funnelId?: number): Observable<any> {
    const url = 'https://api-ext-amberchat.lcmti.com.br/kb/funnel';

    const headers = new HttpHeaders().append(
      'Content-Type',
      'application/json',
    );

    const body = {
      funnel_id: funnelId || null,
      user_id: this.userId,
      sys_id: this.systemId,
      name: data.name,
      organizations: data.organizations,
      status: true,
    };

    return this.http.post<any>(url, body, { headers });
  }

  public deleteFunnel(data: any): Observable<any> {
    const url = 'https://api-ext-amberchat.lcmti.com.br/kb/funnel';

    const body = {
      user_id: this.userId,
      sys_id: this.systemId,
      id: data.funnelId,
    };

    return this.http.delete<any>(url, { body });
  }

  public getTags(): Observable<any> {
    const url = 'https://api-ext-amberchat.lcmti.com.br/kb/taginfo';

    const headers = new HttpHeaders().append(
      'Content-Type',
      'application/json',
    );

    const body = {
      user_id: this.userId,
      sys_id: this.systemId,
    };

    return this.http.post<any>(url, body, { headers });
  }

  public createTag(data: any, tagId?: number): Observable<any> {
    const url = 'https://api-ext-amberchat.lcmti.com.br/kb/tag';

    const headers = new HttpHeaders().append(
      'Content-Type',
      'application/json',
    );

    const body = {
      tag_id: tagId || null,
      user_id: this.userId,
      sys_id: this.systemId,
      organization_id: data.orgId,
      rgb: data.color,
      name: data.name,
    };

    return this.http.post<any>(url, body, { headers });
  }

  public deleteTag(data: any): Observable<any> {
    const url = 'https://api-ext-amberchat.lcmti.com.br/kb/tag';

    const body = {
      user_id: this.userId,
      sys_id: this.systemId,
      id: data.tagId,
      organization_id: data.orgId,
    };

    return this.http.delete<any>(url, { body });
  }

  public createStep(data: any, stepId?: number): Observable<any> {
    const url = 'https://api-ext-amberchat.lcmti.com.br/kb/steps';

    const headers = new HttpHeaders().append(
      'Content-Type',
      'application/json',
    );

    const body = {
      step_id: stepId,
      user_id: this.userId,
      sys_id: this.systemId,
      funnel_id: data.funnelId,
      name: data.name,
      rgb: data.color,
      is_conclusivo: data.lastStep,
      status: '',
    };

    return this.http.post<any>(url, body, { headers });
  }

  public deleteStep(stepId: number, funnelId: number): Observable<any> {
    const url = 'https://api-ext-amberchat.lcmti.com.br/kb/steps';

    const body = {
      user_id: this.userId,
      sys_id: this.systemId,
      id: stepId,
      funnel_id: funnelId,
    };

    return this.http.delete<any>(url, { body });
  }

  public getCardById(cardId?: number): Observable<any> {
    const url = 'https://api-ext-amberchat.lcmti.com.br/kb/cardinfo';

    const headers = new HttpHeaders().append(
      'Content-Type',
      'application/json',
    );

    const body = {
      user_id: this.userId,
      sys_id: this.systemId,
      card_id: cardId,
    };

    return this.http.post<any>(url, body, { headers });
  }

  public createCard(data: any, cardId?: number): Observable<any> {
    const url = 'https://api-ext-amberchat.lcmti.com.br/kb/card';

    const headers = new HttpHeaders().append(
      'Content-Type',
      'application/json',
    );

    const body = {
      card_id: cardId,
      user_id: this.userId,
      sys_id: this.systemId,
      step_id: data.stepId,
      name: data.name,
      new_is_start: false,
      status: 1,
      priority: 1,
      obs: data.obs,
      list_responsable: data.responsibles || [],
      list_tags: data.tags || [],
      date: data.time,
      date_is_due: false,
      list_contacts: data.contacts || [],
    };

    return this.http.post<any>(url, body, { headers });
  }

  public deleteCard(stepId: number, cardId: number): Observable<any> {
    const url = 'https://api-ext-amberchat.lcmti.com.br/kb/card';

    const body = {
      id: cardId,
      user_id: this.userId,
      sys_id: this.systemId,
      step_id: stepId,
    };

    return this.http.delete<any>(url, { body });
  }

  public moveCard(data: any): Observable<any> {
    const url = 'https://api-ext-amberchat.lcmti.com.br/kb/card';

    const headers = new HttpHeaders().append(
      'Content-Type',
      'application/json',
    );

    const body = {
      user_id: this.userId,
      sys_id: this.systemId,
      card_id: data.cardId,
      current_step_id: parseInt(data.stepId),
      new_step_id: parseInt(data.newStepId),
      new_list_order: data.newListOrder,
    };

    return this.http.patch<any>(url, body, { headers });
  }

  public moveStep(data: any): Observable<any> {
    const url = 'https://api-ext-amberchat.lcmti.com.br/kb/steps';

    const headers = new HttpHeaders().append(
      'Content-Type',
      'application/json',
    );

    const body = {
      user_id: this.userId,
      sys_id: this.systemId,
      step_id: data.stepId,
      funnel_id: data.funnelId,
      new_funnel_list: data.newFunnelList,
    };

    return this.http.patch<any>(url, body, { headers });
  }

  public getNotes(data: any): Observable<any> {
    const url = 'https://api-ext-amberchat.lcmti.com.br/kb/noteinfo';

    const headers = new HttpHeaders().append(
      'Content-Type',
      'application/json',
    );

    const body = {
      user_id: this.userId,
      sys_id: this.systemId,
      card_id: data.cardId,
    };

    return this.http.post<any>(url, body, { headers });
  }

  public addNote(data: any): Observable<any> {
    const url = 'https://api-ext-amberchat.lcmti.com.br/kb/note';

    const headers = new HttpHeaders().append(
      'Content-Type',
      'application/json',
    );

    const body = {
      user_id: this.userId,
      sys_id: this.systemId,
      card_id: data.cardId,
      name: '',
      type: 1,
      text: data.text,
    };

    return this.http.post<any>(url, body, { headers });
  }

  public getTasks(data: any): Observable<any> {
    const url = 'https://api-ext-amberchat.lcmti.com.br/kb/taskinfo';

    const headers = new HttpHeaders().append(
      'Content-Type',
      'application/json',
    );

    const body = {
      user_id: this.userId,
      sys_id: this.systemId,
      card_id: data.cardId,
    };

    return this.http.post<any>(url, body, { headers });
  }

  public addTask(
    data: any,
    taskId?: number,
    complete = false,
  ): Observable<any> {
    const url = 'https://api-ext-amberchat.lcmti.com.br/kb/task';

    const headers = new HttpHeaders().append(
      'Content-Type',
      'application/json',
    );

    const body = {
      task_id: taskId,
      user_id: this.userId,
      sys_id: this.systemId,
      card_id: data.cardId,
      name: data.name,
      date: data.time,
      date_is_due: data.isDeadline,
      is_finished: complete,
      type: 1,
      text: data.description,
      list_responsable: data.responsibles,
    };

    return this.http.post<any>(url, body, { headers });
  }

  public setTaskCompletion(data: any): Observable<any> {
    const url = 'https://api-ext-amberchat.lcmti.com.br/kb/task';

    const headers = new HttpHeaders().append(
      'Content-Type',
      'application/json',
    );

    const body = {
      task_id: data.taskId,
      user_id: this.userId,
      sys_id: this.systemId,
      card_id: data.cardId,
      name: data.name,
      date: data.time,
      date_is_due: false,
      type: 1,
      text: data.description,
      is_finished: data.complete,
      list_responsable: data.responsibles,
    };

    return this.http.post<any>(url, body, { headers });
  }

  public deleteTask(data: any): Observable<any> {
    const url = 'https://api-ext-amberchat.lcmti.com.br/kb/task';

    const body = {
      user_id: this.userId,
      sys_id: this.systemId,
      card_id: data.cardId,
      id: data.taskId,
    };

    return this.http.delete<any>(url, { body });
  }

  connectToKanbanWebSocket() {
    const wsUrl = `https://api-ext-amberchat.lcmti.com.br/websockets`;

    this.socket$ = webSocket(wsUrl);
    this.socket$.next({
      safira_system_id: this.systemId,
      safira_service: 'kanban',
      safira_user: this.userId,
    });

    return this.socket$;
  }

  disconnectKanbanWebSocket() {
    this.socket$.complete();
  }

  public getContacts(query: string): Observable<any> {
    const url = 'https://api-ext-amberchat.lcmti.com.br/contacts';

    const headers = new HttpHeaders().append(
      'Content-Type',
      'application/json',
    );

    const body = {
      user_id: this.userId,
      sys_id: this.systemId,
      qr: query,
    };

    return this.http.post<any>(url, body, { headers });
  }

  public createProduct(data: any, productId?: string): Observable<any> {
    const url = 'https://api-ext-amberchat.lcmti.com.br/kb/product';

    const headers = new HttpHeaders().append(
      'Content-Type',
      'application/json',
    );

    const body = {
      user_id: this.userId,
      sys_id: this.systemId,
      product_id: productId,
      name: data.name,
      price: parseFloat(data.price),
      uni_measure: data.uni_measure || 'Min',
      due_date: data.due_date || 0,
      uni_due_date: data.uni_due_date || 'Min',
      is_active: true,
    };

    return this.http.post<any>(url, body, { headers });
  }

  public deleteProduct(productId: string): Observable<any> {
    const url = 'https://api-ext-amberchat.lcmti.com.br/kb/product';

    const body = {
      user_id: this.userId,
      sys_id: this.systemId,
      id: productId,
    };

    return this.http.delete<any>(url, { body });
  }

  public getProducts(): Observable<any> {
    const url = 'https://api-ext-amberchat.lcmti.com.br/kb/productinfo';

    const headers = new HttpHeaders().append(
      'Content-Type',
      'application/json',
    );

    const body = {
      user_id: this.userId,
      sys_id: this.systemId,
    };

    return this.http.post<any>(url, body, { headers });
  }

  public createProductCardRelation(
    data: any,
    relationId?: string,
  ): Observable<any> {
    const url = 'https://api-ext-amberchat.lcmti.com.br/kb/product_card';

    const headers = new HttpHeaders().append(
      'Content-Type',
      'application/json',
    );

    const body = {
      user_id: this.userId,
      sys_id: this.systemId,
      relation_id: relationId,
      product_id: data.product,
      card_id: data.card_id,
      value: parseFloat(data.value || data.valor),
      desconto: data.discount,
      acrescimo: data.increase,
      obs: data.obs || '',
    };

    return this.http.post<any>(url, body, { headers });
  }

  public deleteProductCardRelation(
    data: any,
    relationId: string,
  ): Observable<any> {
    const url = 'https://api-ext-amberchat.lcmti.com.br/kb/product_card';

    const body = {
      user_id: this.userId,
      sys_id: this.systemId,
      product_id: data.productId,
      card_id: data.cardId,
      id: relationId,
    };

    return this.http.delete<any>(url, { body });
  }

  public createReminder(data: any, cardId?: number): Observable<any> {
    const url = 'https://api-ext-amberchat.lcmti.com.br/kb/reminder';

    const headers = new HttpHeaders().append(
      'Content-Type',
      'application/json',
    );

    const body = {
      user_id: this.userId,
      sys_id: this.systemId,
      list_lembretes: [
        {
          tipo_alvo: data.targetType,
          id_alvo: data.targetId,
          tempo: data.time,
          card_id: cardId,
          user_target: data.targetUserType,
        },
      ],
    };

    return this.http.post<any>(url, body, { headers });
  }

  public deleteReminder(
    cardId: string,
    reminderId: string,
  ): Observable<any> {
    const url = 'https://api-ext-amberchat.lcmti.com.br/kb/reminder';

    const body = {
      user_id: this.userId,
      sys_id: this.systemId,
      card_id: cardId,
      id: reminderId,
    };
    return this.http.delete<any>(url, { body });
  }
}
