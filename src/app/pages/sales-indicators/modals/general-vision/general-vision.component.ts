import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ISalesIndicatorsSeller } from '../../../../shared/interfaces/sales-indicators.interface';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { NzEmptyComponent } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputDirective, NzInputGroupComponent } from 'ng-zorro-antd/input';
import { NzPaginationComponent } from 'ng-zorro-antd/pagination';
import { NzTabComponent, NzTabSetComponent } from 'ng-zorro-antd/tabs';
import { NzTableModule, NzTableSortFn } from 'ng-zorro-antd/table';
import { SalesIndicatorsService } from '../../sales-indicators.service';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

@Component({
  selector: 'app-general-vision',
  standalone: true,
  imports: [
    DecimalPipe,
    FormsModule,
    NzEmptyComponent,
    NzGridModule,
    NzIconModule,
    NzInputDirective,
    NzInputGroupComponent,
    NzPaginationComponent,
    NzTabComponent,
    NzTabSetComponent,
    NzTableModule,
    NzToolTipModule,
  ],
  providers: [SalesIndicatorsService],
  templateUrl: './general-vision.component.html',
  styleUrl: './general-vision.component.scss',
})
export class GeneralVisionComponent implements OnInit, OnDestroy {
  @Input() public sellers: ISalesIndicatorsSeller[] = inject(NZ_MODAL_DATA);

  public sellerContacts!: any[];
  public query!: string;

  public currentPage: number = 1;
  public totalItems: number = 0;
  public pageSize: number = 100;

  public sort: { column: string; direction: string | null } = {
    column: 'faturamento_total',
    direction: 'asc',
  };

  public channelSort: {
    column: keyof ISalesIndicatorsSeller;
    direction: string | null;
  } = {
    column: 'vendedor',
    direction: 'ascend',
  };

  private readonly salesIndicatorsService = inject(SalesIndicatorsService);

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

  public onChannelSort(
    column: keyof ISalesIndicatorsSeller,
    direction: string | null,
  ): void {
    this.channelSort = {
      column,
      direction,
    };

    const sortByCalculation = (
      a: ISalesIndicatorsSeller,
      b: ISalesIndicatorsSeller,
      calc: (seller: ISalesIndicatorsSeller) => number,
    ) => {
      const result = calc(a) - calc(b);
      return direction === 'ascend' ? result : -result;
    };

    if (column === 'convertido_per' || column === 'nao_convertido') {
      const calc =
        column === 'convertido_per'
          ? (seller: ISalesIndicatorsSeller) =>
              seller.qtd_contato_convertido / seller.qtd_tot_contato
          : (seller: ISalesIndicatorsSeller) =>
              seller.qtd_tot_contato - seller.qtd_contato_convertido;

      this.sellers.sort((a, b) => sortByCalculation(a, b, calc));
    } else {
      this.sellers.sort((a, b) => {
        return direction === 'ascend'
          ? a[column] < b[column]
            ? -1
            : a[column] > b[column]
              ? 1
              : 0
          : a[column] < b[column]
            ? 1
            : a[column] > b[column]
              ? -1
              : 0;
      });
    }
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

  private getAllSellersContacts(): void {
    this.salesIndicatorsService
      .getAllSellersContacts(this.query, this.currentPage, 0, this.sort, this.pageSize)
      .pipe(takeUntil(this.unsubscribe$), debounceTime(2000))
      .subscribe({
        next: (res) => {
          this.sellerContacts = res.contatos;
          this.totalItems = res.total_items;
        },
      });
  }
}
