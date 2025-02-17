import { ChatbotModalComponent } from '../chatbot/chatbot.component';
import { Component, inject, Input } from '@angular/core';
import { DataCardComponent } from '../../data-card/data-card.component';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ISalesIndicatorsSeller } from '../../../../shared/interfaces/sales-indicators.interface';
import { NZ_MODAL_DATA, NzModalService } from 'ng-zorro-antd/modal';
import { NzEmptyComponent } from 'ng-zorro-antd/empty';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputDirective, NzInputGroupComponent } from 'ng-zorro-antd/input';
import { NzPaginationComponent } from 'ng-zorro-antd/pagination';
import { NzTabComponent, NzTabSetComponent } from 'ng-zorro-antd/tabs';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { SalesIndicatorsService } from '../../sales-indicators.service';

@Component({
  selector: 'app-seller-detail',
  standalone: true,
  imports: [
    DataCardComponent,
    DecimalPipe,
    FormsModule,
    NzEmptyComponent,
    NzGridModule,
    NzInputDirective,
    NzInputGroupComponent,
    NzPaginationComponent,
    NzTabComponent,
    NzTabSetComponent,
    NzTableModule,
    NzToolTipModule,
  ],
  templateUrl: './seller-detail.component.html',
  styleUrl: './seller-detail.component.scss',
})
export class SellerDetailComponent {
  @Input() public data: { seller: ISalesIndicatorsSeller } =
    inject(NZ_MODAL_DATA);

  public sellerContacts: any[] = [];
  public query!: string;

  public currentPage: number = 1;
  public totalItems: number = 0;
  public pageSize: number = 100;

  public sort: { column: string; direction: string | null } = {
    column: 'faturamento_total',
    direction: 'asc',
  };

  private readonly salesIndicatorsService = inject(SalesIndicatorsService);
  private readonly modalService = inject(NzModalService);

  private readonly unsubscribe$ = new Subject();

  ngOnInit(): void {
    this.getAllSellersContacts();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next(true);
    this.unsubscribe$.unsubscribe();
  }

  public onPageSizeChange(pageSize: number) {
    this.pageSize = pageSize;
    this.getAllSellersContacts();
  }

  public onSearchChange(query: string): void {
    this.query = query;
    this.getAllSellersContacts();
  }

  public onPageChange(page: number): void {
    if (page) {
      this.currentPage = page;
      this.getAllSellersContacts();
    }
  }

  public openChatBotModal(contact: any): void {
    this.modalService.create({
      nzContent: ChatbotModalComponent,
      nzData: { contact, channelId: this.data.seller.token_canal },
      nzWidth: '80%',
      nzOkText: null,
      nzCancelText: null,
    });
  }

  public onSortChange(column: string, direction: string | null): void {
    this.sort = {
      column,
      direction:
        direction === 'ascend'
          ? 'asc'
          : direction === 'descend'
            ? 'desc'
            : null,
    };

    this.getAllSellersContacts();
  }

  private getAllSellersContacts() {
    this.salesIndicatorsService
      .getAllSellersContacts(
        this.query,
        this.currentPage,
        this.data.seller.id,
        this.sort,
        this.pageSize
      )
      .pipe(takeUntil(this.unsubscribe$), debounceTime(2000))
      .subscribe({
        next: (res) => {
          this.sellerContacts = res.contatos;
          this.totalItems = res.total_items;
        },
      });
  }
}
