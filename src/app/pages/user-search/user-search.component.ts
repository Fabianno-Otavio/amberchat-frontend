import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CreateServiceService } from './create-service.service';
import { FilterComponent } from './filter/filter.component';
import { FilterSelectService } from './filter-selects.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ISetupScreen } from '../../shared/interfaces/setup-screen.interface';
import { IUserFilter } from '../../shared/interfaces/user-filter.interface';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { NewServiceModalComponent } from './new-service-modal/new-service-modal.component';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { UserSearchService } from './user-search.service';
import {
  debounceTime,
  distinctUntilChanged,
  shareReplay,
  Subject,
  takeUntil,
} from 'rxjs';
import {
  IUserData,
  IUserDataDetail,
} from '../../shared/interfaces/user-response.interface';
import {
  formatPhoneNumber,
  isNameEqualsPhone,
} from '../../shared/utils/phone.utils';

@Component({
  selector: 'app-user-search',
  standalone: true,
  imports: [
    CommonModule,
    FilterComponent,
    LoadingComponent,
    NzButtonModule,
    NzCardModule,
    NzCollapseModule,
    NzDropDownModule,
    NzEmptyModule,
    NzFormModule,
    NzGridModule,
    NzIconModule,
    NzInputModule,
    NzPaginationModule,
    NzTableModule,
    NzTagModule,
    ReactiveFormsModule,
  ],
  providers: [
    CreateServiceService,
    FilterSelectService,
    NzModalService,
    UserSearchService,
  ],
  templateUrl: './user-search.component.html',
  styleUrl: './user-search.component.scss',
})
export class UserSearchComponent implements OnInit, OnDestroy {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly createServiceService = inject(CreateServiceService);
  private readonly fb = new FormBuilder();
  private readonly filterSelectsService = inject(FilterSelectService);
  private readonly messageService = inject(NzMessageService);
  private readonly modalService = inject(NzModalService);
  private readonly unsubscribe$ = new Subject();
  private readonly userSearchService = inject(UserSearchService);

  public currentPage: number = 1;
  public dropdownOpen = false;
  public filter: IUserFilter = { query: '' };
  public filterSelects!: ISetupScreen;
  public form: FormGroup = new FormGroup({});
  public loading = false;
  public pageSize: number = 20;
  public systemId!: string;
  public totalItems: number = 0;
  public userId!: string;
  public users!: IUserData[];

  ngOnInit(): void {
    this.getUserData();
    this.getSelects();
    this.buildForm();
    this.getUsers();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next(true);
    this.unsubscribe$.unsubscribe();
  }

  public getUsers(): void {
    this.loading = true;
    this.form.disable();

    this.filter.query = this.form.get('query')?.value || '';

    this.userSearchService
      .getUsers({
        userId: this.userId,
        systemId: this.systemId,
        pagination: { page: this.currentPage, page_size: this.pageSize },
        filters: this.filter,
      })
      .pipe(shareReplay(), takeUntil(this.unsubscribe$))
      .subscribe({
        next: (response) => {
          response.data.map((contact) => {
            contact.displayName = this.getDisplayName(contact.json_contato);

            contact.isOnAtendimento = false;
            if (contact.json_atendimento) {
              contact.json_atendimento.map((atendimento) => {
                if ([0, 2].includes(atendimento.status)) {
                  contact.isOnAtendimento = true;
                }
              });
            }
          });

          this.users = response.data;
          this.totalItems = response.total_items;
          this.loading = false;
          this.form.enable();
        },
      });
  }

  public getDisplayName(contact: IUserDataDetail): string {
    if (
      contact.nickName &&
      !isNameEqualsPhone(contact.nickName, contact.number)
    ) {
      return contact.nickName;
    }

    if (contact.name && !isNameEqualsPhone(contact.name, contact.number)) {
      return contact.name;
    }

    if (
      contact.nameFromWhatsApp &&
      !isNameEqualsPhone(contact.nameFromWhatsApp, contact.number)
    ) {
      return contact.nameFromWhatsApp;
    }
    return formatPhoneNumber(contact.number) || '';
  }

  public onPageChange(page: number): void {
    if (page) {
      this.currentPage = page;
      this.getUsers();
    }
  }

  public onPageSizeChange(size: number): void {
    if (size) {
      this.pageSize = size;
      this.currentPage = 1;
      this.getUsers();
    }
  }

  public onFilter(data: any): void {
    this.filter = { ...this.filter, ...data };
    this.getUsers();
    this.dropdownOpen = false;
  }

  public onFilterCancel(message: string): void {
    if (message === 'cancel') {
      this.dropdownOpen = false;
    }
  }

  public openNewServiceModal(e: Event, contactId: string): void {
    e.preventDefault();
    e.stopPropagation();

    this.modalService.create({
      nzContent: NewServiceModalComponent,
      nzTitle: 'Novo Atendimento',
      nzData: {
        channels: this.filterSelects.channels,
        sectors: this.filterSelects.sectors,
      },
      nzOkDisabled: true,
      nzOnOk: (res) => {
        const data = res.form.value;
        this.createService({
          channel: data.channel,
          sector: data.sector,
          contactId: contactId,
        });
      },
    });
  }

  private buildForm(): void {
    this.form = this.fb.group({
      query: [''],
    });

    this.form
      .get('query')
      ?.valueChanges.pipe(
        debounceTime(2000),
        distinctUntilChanged(),
        takeUntil(this.unsubscribe$),
      )
      .subscribe(() => {
        this.getUsers();
      });
  }

  private createService(data: {
    sector: string;
    contactId: string;
    channel: any;
  }): void {
    this.createServiceService
      .createService({
        userId: this.userId,
        sectorId: data.sector,
        contactId: data.contactId,
        channelToken: data.channel.token,
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: () => {
          this.messageService.success('Novo atendimento iniciado.');
        },
        error: (err: HttpErrorResponse) => {
          const error = err.error;
          if (error.errorCode === 'chat_11') {
            this.messageService.error(
              `Usuário já está em atendimento em <b>${data.channel.nome_canal}</b>`,
            );
          } else {
            this.messageService.error(error.msg);
          }
        },
      });
  }

  private getUserData(): void {
    this.activatedRoute.queryParams
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (param) => {
          this.userId = param['userId'] || '';
          this.systemId = param['systemId'] || '';
        },
      });
  }

  private getSelects(): void {
    this.filterSelectsService
      .getAllSelects(this.userId, this.systemId)
      .subscribe({
        next: (data: ISetupScreen) => {
          this.filterSelects = data;
        },
      });
  }
}
