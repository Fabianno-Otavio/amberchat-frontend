import { Component, inject, Input } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NzFlexModule } from 'ng-zorro-antd/flex';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import {
  IContract,
  IUserContract,
  IUserContractResponse,
} from '../../../../shared/interfaces/user-contract.interface';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { UsersContractsService } from '../../users-contracts.service';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { BehaviorSubject, takeUntil } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [
    NzInputModule,
    NzFormModule,
    ReactiveFormsModule,
    NzSwitchModule,
    NzFlexModule,
    NzSelectModule,
    NzButtonModule,
    NzDividerModule
  ],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss',
})
export class UserDetailComponent {
  public data: { isDetail?: boolean; user: IUserContract } =
    inject(NZ_MODAL_DATA);
  public usersContractsService = inject(UsersContractsService);
  private readonly messageService = inject(NzMessageService);

  private readonly fb = inject(FormBuilder);
  public form!: FormGroup;

  public isEditing: boolean = true;

  public userContracts: IContract[] = [];
  public contracts: IContract[] = [];

  public emitOk = new BehaviorSubject<any>(null);

  constructor() {
    if (this.data?.user?.contratos) {
      this.userContracts = this.data?.user?.contratos;
      this.contracts = [...this.userContracts];
    }

    this.form = this.fb.group({
      nome: this.data?.user.nome ?? '',
      admin: this.data?.user.admin ?? false,
      ativo: this.data?.user.ativo ?? true,
      contratos: [this.userContracts.map(c => c.cod_contrato) || null],
      obs: this.data?.user.obs ?? '',
      whatsapp: this.data?.user.whatsapp ?? '',
    });

    this.isEditing = !this.data?.isDetail;

    if (!this.isEditing) {
      this.form.disable();
    }
  }

  public toggleForm(): void {
    if (this.isEditing) {
      this.form.disable();
      this.isEditing = false;
    } else {
      this.form.enable();
      this.isEditing = true;
    }
  }

  public searchContract(query: string): void {
    if (query.length > 2) {
      this.usersContractsService.getContracts(query).subscribe({
        next: (res) => {
          this.contracts = res;
          this.contracts.unshift(...this.userContracts);
        },
      });
    } else {
      this.contracts = [...this.userContracts];
    }
  }

}
