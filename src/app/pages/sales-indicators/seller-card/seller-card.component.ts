import { Component, inject, Input } from '@angular/core';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzCardComponent } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagComponent } from 'ng-zorro-antd/tag';
import { ISalesIndicatorsSeller } from '../../../shared/interfaces/sales-indicators.interface';
import { DecimalPipe } from '@angular/common';
import { NzModalService } from 'ng-zorro-antd/modal';
import { SellerDetailComponent } from '../modals/seller-detail/seller-detail.component';

@Component({
  selector: 'app-seller-card',
  standalone: true,
  imports: [
    NzCardComponent,
    NzButtonComponent,
    NzGridModule,
    NzTagComponent,
    NzIconModule,
    DecimalPipe
  ],
  templateUrl: './seller-card.component.html',
  styleUrl: './seller-card.component.scss',
})
export class SellerCardComponent {
  @Input() public seller!: ISalesIndicatorsSeller;

  private readonly modalService = inject(NzModalService);

  public openSellerDetailModal() {
    this.modalService.create({
      nzContent: SellerDetailComponent,
      nzData: {
        seller: this.seller,
      },
      nzTitle: this.seller.vendedor,
      nzWidth: '90%',
      nzOkText: null,
      nzCancelText: null,
    });
  }
}
