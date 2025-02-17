import { BehaviorSubject } from 'rxjs';
import { Inject } from '@angular/core';

export enum SALES_INDICATOR_PERIOD {
  LAST_YEAR = 'lastYear',
  THIS_YEAR = 'thisYear',
  PREVIOUS_MONTH = 'previousMonth',
  CURRENT_MONTH = 'currentMonth',
  TODAY = 'today',
  CUSTOM = 'custom',
}

@Inject({})
export class SalesIndicatorsStore {
  private systemId = new BehaviorSubject('');
  public $systemId = this.systemId.asObservable();

  private userId = new BehaviorSubject('');
  public $userId = this.userId.asObservable();

  private sellerId = new BehaviorSubject('');
  public $sellerId = this.sellerId.asObservable();

  private period = new BehaviorSubject('');
  public $period = this.period.asObservable();

  private organizations = new BehaviorSubject<string[] | null>(null);
  public $organizations = this.organizations.asObservable();

  private customPeriodRange = new BehaviorSubject<{ i: string; f: string }>({
    i: '',
    f: '',
  });
  public $customPeriodRange = this.customPeriodRange.asObservable();

  public setSystemId(systemId: string) {
    this.systemId.next(systemId);
  }

  public setUserId(userId: string) {
    this.userId.next(userId);
    const currentStored = localStorage.getItem('userId');

    if (currentStored !== userId) {
      localStorage.clear();
    }
    localStorage.setItem('userId', userId);
  }

  public setSellerId(sellerId: string) {
    this.sellerId.next(sellerId);
  }

  public setPeriod(period: string) {
    this.period.next(period);
    localStorage.setItem('filter_current_period', period);
  }

  public setOrganizations(organizations: string[] | null) {
    this.organizations.next(organizations);
    localStorage.setItem('filter_organizations', JSON.stringify(organizations));
  }

  public setCustomPeriodRange(customPeriodRange: { i: string; f: string }) {
    if (customPeriodRange.i) {
      this.customPeriodRange.next(customPeriodRange);
      localStorage.setItem(
        'filter_custom_period',
        JSON.stringify(customPeriodRange),
      );
    } else {
      this.customPeriodRange.next({ i: '', f: '' });
      localStorage.removeItem('filter_custom_period');
    }
  }
}
