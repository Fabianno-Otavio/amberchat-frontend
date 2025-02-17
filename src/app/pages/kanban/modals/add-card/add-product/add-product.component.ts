import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NZ_MODAL_DATA, NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { KanbanService } from '../../../kanban.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { LoadingComponent } from '../../../../../shared/components/loading/loading.component';
import { NzFlexModule } from 'ng-zorro-antd/flex';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { CreateProductComponent } from './create-product/create-product.component';
import { BehaviorSubject, shareReplay, take } from 'rxjs';
import { NzDividerModule } from 'ng-zorro-antd/divider';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NzInputModule,
    NzFormModule,
    NzSelectModule,
    NzFlexModule,
    NzButtonModule,
    NzGridModule,
    NzToolTipModule,
    NzPopconfirmModule,
    NzIconModule,
    NzDividerModule,
  ],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.scss',
})
export class AddProductComponent {
  public form!: FormGroup;

  public products!: any[];

  private readonly fb = inject(FormBuilder);
  public readonly data: {
    relation: any;
    unities: any;
  } = inject(NZ_MODAL_DATA);
  private readonly kanbanService = inject(KanbanService);
  private readonly messageService = inject(NzMessageService);
  private readonly modalService = inject(NzModalService);

  public product!: any;

  public emitOk = new BehaviorSubject<any>(null);

  constructor() {
    this.buildForm();
    this.getProducts();
  }

  private buildForm(): void {
    this.form = this.fb.group({
      product: [this.data.relation?.id_produto || '', Validators.required],
      value: '',
      obs: this.data.relation?.obs || '',
    });

    this.formatToCurrency({
      target: {
        value: this.data.relation?.valor || this.data.relation?.preco || '',
      },
    });

    this.form.get('product')?.valueChanges.subscribe({
      next: (value) => {
        this.product = this.products.find((p) => p.id === value);
        this.form.get('value')?.setValue(this.product?.preco || '');

        this.formatToCurrency({ target: { value: this.product?.preco } });
      },
    });
  }

  public getProducts(): void {
    this.kanbanService.getProducts().subscribe({
      next: (res) => {
        this.products = res.data;
      },
      error: (err: any) => {
        if (err) {
          this.messageService.error(err.error.message || err.message);
        }
      },
    });
  }

  public openCreateProductModal(product?: any): void {
    const modal = this.modalService.create({
      nzTitle: 'Criar Produto',
      nzContent: CreateProductComponent,
      nzData: {
        product,
        unities: this.data.unities,
      },
      nzCancelText: null,
      nzOkText: null,
      nzFooter: null,
    });

    modal.componentInstance?.emitOk.subscribe((value) => {
      if (value) {
        this.kanbanService.createProduct({ ...value }, product?.id).subscribe({
          next: (res) => {
            this.getProducts();
            this.messageService.success(res?.message);
            modal.close();
          },
          error: (err: any) => {
            if (err) {
              this.messageService.error(err.error.message || err.message);
            }
          },
        });
      }
    });
  }

  public deleteProduct(product: any): void {
    this.kanbanService.deleteProduct(product.id).subscribe({
      next: (res) => {
        this.getProducts();
        this.messageService.success(res?.message);
      },
      error: (err: any) => {
        if (err) {
          this.messageService.error(err.error.message || err.message);
        }
      },
    });
  }

  public formatToCurrency(event: any): void {
    const value = event.target?.value;

    if (value) {
      this.form.get('value')?.setValue(parseFloat(value).toFixed(2));
    }
  }
}
