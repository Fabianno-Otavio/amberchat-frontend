import { ActivatedRoute } from '@angular/router';
import { AdminPanelComponent } from './modals/admin-panel/admin-panel.component';
import { AudioPlayerComponent } from '../../shared/components/chatbot/message/audio-player/audio-player.component';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { DataCardComponent } from './data-card/data-card.component';
import { DateRangeFilterComponent } from './modals/date-range-filter/date-range-filter.component';
import { FileComponent } from '../../shared/components/chatbot/message/file/file.component';
import { FormsModule } from '@angular/forms';
import { GeneralVisionComponent } from './modals/general-vision/general-vision.component';
import { ISalesIndicators } from '../../shared/interfaces/sales-indicators.interface';
import { ISSOrganization } from '../../shared/interfaces/setup-screen.interface';
import { NzButtonComponent, NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardComponent } from 'ng-zorro-antd/card';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzOptionComponent, NzSelectComponent } from 'ng-zorro-antd/select';
import { SalesIndicatorsStore } from './sales-indicators.store';
import { SellerCardComponent } from './seller-card/seller-card.component';
import { Subject, takeUntil } from 'rxjs';
import {
  SALES_INDICATOR_PERIOD,
  SalesIndicatorsService,
} from './sales-indicators.service';

export enum SALES_INDICATOR_PERIOD_TRANSLATOR {
  'lastYear' = 'Ano anterior',
  'thisYear' = 'Ano atual',
  'previousMonth' = 'Mês anterior',
  'currentMonth' = 'Mês atual',
  'today' = 'Hoje',
  'custom' = 'Período',
}

@Component({
  selector: 'app-sales-indicators',
  standalone: true,
  imports: [
    DataCardComponent,
    FormsModule,
    NzButtonModule,
    NzDropDownModule,
    NzGridModule,
    NzIconModule,
    SellerCardComponent,
    NzSelectComponent,
    NzOptionComponent,
    NzButtonComponent,
  ],
  providers: [SalesIndicatorsService, NzModalService, SalesIndicatorsStore],
  templateUrl: './sales-indicators.component.html',
  styleUrl: './sales-indicators.component.scss',
})
export class SalesIndicatorsComponent implements OnInit, OnDestroy {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly modalService = inject(NzModalService);
  private readonly messageService = inject(NzMessageService);
  private readonly salesIndicatorsService = inject(SalesIndicatorsService);
  private readonly salesIndicatorsStore = inject(SalesIndicatorsStore);

  private readonly unsubscribe$ = new Subject();

  public period!: string;
  public translatedPeriod!: string;

  public salesIndicatorPeriod = SALES_INDICATOR_PERIOD;

  public salesIndicators!: ISalesIndicators;
  public organizations!: ISSOrganization[];
  public systemId!: string;
  public userId!: string;

  public dropdownHideOnClick = true;

  public currentOrganizations: string[] = [];

  ngOnInit(): void {
    this.getUserData();
    this.initData();
    this.getSalesIndicators();
    this.getOrganizations();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next(true);
    this.unsubscribe$.unsubscribe();
  }

  public openGeneralVisionModal(): void {
    this.modalService.create({
      nzContent: GeneralVisionComponent,
      nzData: this.salesIndicators.vendedores,
      nzTitle: 'VISÃO GERAL',
      nzWidth: '90%',
      nzOkText: null,
      nzCancelText: null,
    });
  }

  public openFilterDateRangeModal(): void {
    this.modalService.create({
      nzContent: DateRangeFilterComponent,
      nzTitle: 'FILTRO POR PERÍODO',
      nzOkText: 'APLICAR FILTRO',
      nzCancelText: null,
      nzOnOk: (c) => {
        const customPeriodRange = {
          i: c.dateRange[0]
            .toLocaleString()
            .substring(0, 10)
            .replaceAll('/', ''),
          f: c.dateRange[1]
            .toLocaleString()
            .substring(0, 10)
            .replaceAll('/', ''),
        };

        this.salesIndicatorsStore.setPeriod(this.period);
        this.salesIndicatorsStore.setCustomPeriodRange(customPeriodRange);

        this.getSalesIndicators();
      },
    });
  }

  public onPeriodChange(period: SALES_INDICATOR_PERIOD): void {
    this.period = period;
    this.translatedPeriod = SALES_INDICATOR_PERIOD_TRANSLATOR[period];
    this.salesIndicatorsStore.setCustomPeriodRange({ i: '', f: '' });

    if (period === SALES_INDICATOR_PERIOD.CUSTOM) {
      this.openFilterDateRangeModal();
    } else {
      this.salesIndicatorsStore.setPeriod(period);
      this.salesIndicatorsStore.setCustomPeriodRange({ i: '', f: '' });

      this.getSalesIndicators();
    }
  }

  public onOrganizationChange(organizations: any[]): void {
    this.salesIndicatorsStore.setOrganizations(organizations);
    this.getSalesIndicators();
  }

  public openAdminModal(): void {
    this.modalService.create({
      nzTitle: 'Permissionamento',
      nzContent: AdminPanelComponent,
      nzWidth: '80%',
      nzCancelText: null,
      nzOkText: 'Salvar',
      nzOnOk: (c) => {
        if (c.form) {
          const payload: any = [];

          const form = c.form.value;

          Object.keys(form).map((userId) => {
            const user = form[userId];
            if (user.listChannelsAllowed || user.listOrganizationsAllowed) {
              payload.push({
                iduser: userId,
                listChannelsAllowed: user.listChannelsAllowed ?? [],
                listOrganizationsAllowed: user.listOrganizationsAllowed ?? [],
              });
            }
          });

          this.salesIndicatorsService.setPermissions(payload).subscribe({
            next: (r) => {
              if (r.success === true) {
                this.messageService.success(r.message);
              }
            },
            error: (e: any) => {
              this.messageService.error(
                'Falha ao salvar preferências de usuários.',
              );
              console.error(e);
            },
          });
        }
      },
    });
  }

  private getUserData(): void {
    this.activatedRoute.queryParams
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (param) => {
          this.systemId = param['systemId'] || '';
          this.salesIndicatorsStore.setSystemId(this.systemId);

          this.userId = param['userId'] || '';
          this.salesIndicatorsStore.setUserId(this.userId);
        },
      });
  }

  private getSalesIndicators(): void {
    this.salesIndicatorsService
      .getSalesIndicators()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (res) => {
          this.salesIndicators = res;
        },
      });
  }

  private getOrganizations(): void {
    this.salesIndicatorsService
      .getOrganizations()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (res) => {
          this.organizations = res.organizations;
        },
      });
  }

  private initData(): void {
    const customPeriodRange: { i: string; f: string } =
      JSON.parse(localStorage.getItem('filter_custom_period') as string) || '';
    const period: SALES_INDICATOR_PERIOD =
      (localStorage.getItem(
        'filter_current_period',
      ) as SALES_INDICATOR_PERIOD) || SALES_INDICATOR_PERIOD.TODAY;

    if (period === SALES_INDICATOR_PERIOD.CUSTOM && !customPeriodRange) {
      this.salesIndicatorsStore.setPeriod(SALES_INDICATOR_PERIOD.TODAY);
    } else {
      this.salesIndicatorsStore.setPeriod(period);
      this.salesIndicatorsStore.setCustomPeriodRange(customPeriodRange);
    }

    this.salesIndicatorsStore.$period
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (period) => {
          this.period = period;
          this.translatedPeriod =
            SALES_INDICATOR_PERIOD_TRANSLATOR[period as SALES_INDICATOR_PERIOD];
        },
      });

    const orgs = JSON.parse(
      localStorage.getItem('filter_organizations') || '[]',
    );

    this.salesIndicatorsStore.setOrganizations(orgs);

    this.salesIndicatorsStore.$organizations
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (orgs) => {
          this.currentOrganizations = orgs as string[];
        },
      });
  }
}
