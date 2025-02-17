import { Component, inject, OnDestroy } from '@angular/core';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IUserContract } from '../../shared/interfaces/user-contract.interface';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzTableModule } from 'ng-zorro-antd/table';
import { UserDetailComponent } from './modals/user-detail/user-detail.component';
import { UsersContractsService } from './users-contracts.service';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { NzFlexModule } from 'ng-zorro-antd/flex';
import { NzTagModule } from 'ng-zorro-antd/tag';

@Component({
  selector: 'app-users-contracts',
  standalone: true,
  imports: [
    NzButtonModule,
    NzCardModule,
    NzDividerModule,
    NzGridModule,
    NzIconModule,
    NzInputModule,
    NzFlexModule,
    NzPopconfirmModule,
    NzTableModule,
    ReactiveFormsModule,
    NzEmptyModule,
    NzTagModule,
    LoadingComponent,
  ],
  providers: [UsersContractsService, NzModalService, NzMessageService],
  templateUrl: './users-contracts.component.html',
  styleUrl: './users-contracts.component.scss',
})
export class UsersContractsComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly modalService = inject(NzModalService);
  private readonly usersContractsService = inject(UsersContractsService);
  private readonly messageService = inject(NzMessageService);

  private readonly unsubscribe$ = new Subject();

  public form!: FormGroup;

  public users: IUserContract[] = [];
  public loadingTable = false;

  constructor() {
    this.form = this.fb.group({
      query: '',
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

    this.getUsers();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next(true);
    this.unsubscribe$.unsubscribe();
  }

  public getUsers(): void {
    this.loadingTable = true;
    this.usersContractsService
      .getUsers({ query: this.form.get('query')?.value })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (res) => {
          this.users = res.data;
          this.loadingTable = false;
        },
        error: (err: any) => {
          this.messageService.error(err.message);
        },
      });
  }

  public openCreateModal(): void {
    const modal = this.modalService.create({
      nzContent: UserDetailComponent,
      nzTitle: 'Incluir Usuário',
      nzCancelText: null,
      nzOkText: null,
      nzFooter: null,
    });

    modal.afterOpen.subscribe((c) => {
      modal.componentInstance?.emitOk.subscribe((value) => {
        if (value) {
          this.usersContractsService
          .createUser(value)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe({
            next: () => {
              this.messageService.success('Usuário adicionado com sucesso');
              this.getUsers();
              modal.close();
            },
            error: (err: any) => {
              this.messageService.error(err.message);
            },
          });
        }
      });
    });
  }

  public openEditModal(user: IUserContract, isDetail?: boolean): void {
    const modal = this.modalService.create({
      nzContent: UserDetailComponent,
      nzTitle: user.nome,
      nzData: { isDetail, user },
      nzCancelText: null,
      nzOkText: null,
      nzFooter: null,
    });

    modal.afterOpen.subscribe((c) => {
      modal.componentInstance?.emitOk.subscribe((value) => {
        if (value) {
          this.editUser(value, user.id, modal);
        }
      });
    });
  }

  private editUser(
    form: IUserContract,
    userId: number,
    modalInstance: NzModalRef<any>,
  ): void {
    this.usersContractsService
      .updateUser({ ...form, id: userId })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: () => {
          this.messageService.success('Usuário editado com sucesso');
          this.getUsers();
          modalInstance.close();
        },
        error: (err: any) => {
          this.messageService.error(err.message);
        },
      });
  }

  public deleteUser(userId: number): void {
    this.usersContractsService
      .deleteUser(userId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: () => {
          this.messageService.success('Usuário deletado com sucesso');
          this.getUsers();
        },
        error: (err: any) => {
          this.messageService.error(err.message);
        },
      });
  }
}
