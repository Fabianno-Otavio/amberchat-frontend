import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserStore {
  private systemId = new BehaviorSubject('');
  public $systemId = this.systemId.asObservable();

  private userId = new BehaviorSubject('');
  public $userId = this.userId.asObservable();

  public setSystemId(systemId: string): void {
    this.systemId.next(systemId);
  }

  public setUserId(userId: string): void {
    this.userId.next(userId);

    const currentStored = localStorage.getItem('userId');

    if (currentStored !== userId) {
      localStorage.clear();
    }
    localStorage.setItem('userId', userId);
  }
}
