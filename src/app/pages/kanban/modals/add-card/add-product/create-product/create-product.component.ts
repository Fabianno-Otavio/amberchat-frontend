import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFlexModule } from 'ng-zorro-antd/flex';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { LoadingComponent } from '../../../../../../shared/components/loading/loading.component';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';
import { BehaviorSubject } from 'rxjs';
import { NzDividerModule } from 'ng-zorro-antd/divider';

@Component({
  selector: 'app-create-product',
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
    NzTreeSelectModule,
    NzDividerModule,
  ],
  templateUrl: './create-product.component.html',
  styleUrl: './create-product.component.scss',
})
export class CreateProductComponent {
  public form!: FormGroup;

  private readonly fb = inject(FormBuilder);

  public emitOk = new BehaviorSubject<any>(null);

  public readonly data: {
    product: any;
    unities: any;
  } = inject(NZ_MODAL_DATA);
  constructor() {
    this.buildForm();
  }

  private buildForm(): void {
    this.form = this.fb.group({
      name: [this.data.product?.nome || '', Validators.required],
      price: [this.data.product?.preco || '', Validators.required],
    });
  }

  public formatToCurrency(event: any): void {
    const value = event.target?.value;

    if (value) {
      this.form.get('price')?.setValue(parseFloat(value).toFixed(2));
    }
  }
}
