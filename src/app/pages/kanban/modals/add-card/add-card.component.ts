import { getFirstLetters } from './../../../../shared/utils/string.utils';
import { AddTagComponent } from './add-tag/add-tag.component';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ICard, IStep } from '../../kanban.component';
import { KanbanService } from '../../kanban.service';
import { NZ_MODAL_DATA, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFlexModule } from 'ng-zorro-antd/flex';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { AddTaskComponent } from './add-task/add-task.component';
import { CommonModule, DatePipe, registerLocaleData } from '@angular/common';
import {
  formatPhoneNumber,
  isNameEqualsPhone,
} from '../../../../shared/utils/phone.utils';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzMessageService } from 'ng-zorro-antd/message';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { AddProductComponent } from './add-product/add-product.component';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzEllipsisPipe } from 'ng-zorro-antd/pipes';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { BehaviorSubject, filter } from 'rxjs';
import { AddContactComponent } from './add-contact/add-contact.component';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { AddReminderComponent } from './add-reminder/add-reminder.component';
import { NzBadgeModule } from 'ng-zorro-antd/badge';

@Component({
  selector: 'app-add-task',
  standalone: true,
  imports: [
    LoadingComponent,
    CommonModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzInputModule,
    NzIconModule,
    NzFormModule,
    NzSelectModule,
    NzGridModule,
    NzCardModule,
    NzAvatarModule,
    NzDividerModule,
    NzFlexModule,
    NzPopconfirmModule,
    NzToolTipModule,
    NzTableModule,
    NzTabsModule,
    DatePipe,
    NzTypographyModule,
    NzEllipsisPipe,
    NzTagModule,
    NzDatePickerModule,
    NzSwitchModule,
    NzBadgeModule,
  ],
  templateUrl: './add-card.component.html',
  styleUrl: './add-card.component.scss',
})
export class AddCardComponent {
  public form!: FormGroup;
  public noteForm!: FormGroup;

  public tags: any;
  public selectedTags: any = [];
  public isEditing!: boolean;

  public tasks!: any[];
  public reminders: any[] = [];
  public relations!: any[];
  public notes!: any[];
  public contacts!: any[];

  public loading = false;

  public formatPhoneNumber = formatPhoneNumber;
  public getFirstLetters = getFirstLetters;

  private readonly fb = inject(FormBuilder);
  public readonly data: {
    cardId: number;
    organizations: any;
    users: any;
    unities: any;
    steps: IStep[];
    currentStep: IStep;
  } = inject(NZ_MODAL_DATA);
  private readonly kanbanService = inject(KanbanService);
  private readonly modalService = inject(NzModalService);
  private readonly messageService = inject(NzMessageService);

  public cardData!: ICard;

  public emitOk = new BehaviorSubject<any>(null);

  public selectedProducts: any[] = [];
  public selectedReminders: any[] = [];

  constructor() {
    this.isEditing = !!this.data.cardId;


    if (this.isEditing) {
      this.loading = true;
      this.getCardData();
    } else {
      this.buildForm();
      this.getTags();
    }
  }

  private buildForm(): void {
    this.form = this.fb.group({
      name: [this.cardData?.nome || '', Validators.required],
      tags: [],
      responsibles: [
        this.cardData?.list_responsaveis || [],
        Validators.required,
      ],
      contacts: [this.cardData?.list_contatos?.map((c) => c.id)],
      obs: [this.cardData?.observacoes],
      step: this.data.currentStep.id || '',
      isDeadline: this.cardData?.is_prazo_marcado || false,
      time: [this.cardData?.prazo || '', Validators.required],
    });

    if (this.isEditing) {
      this.form.get('step')?.setValidators([Validators.required]);
    }

    this.noteForm = this.fb.group({
      text: '',
    });
  }

  public setTags(): void {
    const value = this.form.get('tags')?.value;

    if (value) {
      value.map((tagId: number) => {
        this.selectedTags.push(this.tags.find((tag: any) => tag.id === tagId));

        this.form.get('tags')?.reset();

        this.tags = this.tags.filter(
          (tag: any) => !this.selectedTags.includes(tag),
        );
      });
    }
  }

  public removeTag(tag: any) {
    this.selectedTags = this.selectedTags.filter((t: any) => t.id !== tag.id);
    this.tags.push(tag);
  }

  public onStepSelect(value: number): void {
    if (value !== this.data.currentStep.id) {
      let newListOrder: number[] = [];

      const idx = this.data.steps.findIndex((s) => s.id === value);
      if (idx !== -1) {
        newListOrder = this.data.steps[idx].order_cards;
        newListOrder.push(this.data.cardId);
        this.moveCard(this.data.currentStep.id, value, newListOrder);
      }
    }
  }

  private getCardData(): void {
    this.kanbanService.getCardById(this.data.cardId).subscribe({
      next: (res) => {
        this.cardData = res.data;
        const date = new Date(this.cardData.prazo);

        date.setHours(date.getHours() + 3);

        this.cardData.prazo = date;

        const prods = this.cardData.list_products || [];

        this.selectedProducts = prods;

        this.buildForm();
        this.getNotes();
        this.getTasks();
        this.getTags();

        this.loading = false;
      },
    });
  }

  public getTags(): void {
    this.kanbanService.getTags().subscribe({
      next: (res) => {
        this.tags = res.data;

        this.selectedTags = this.tags.filter((tag: any) =>
          this.cardData?.list_tags?.includes(tag.id),
        );

        this.tags = this.tags.filter(
          (tag: any) => !this.selectedTags.includes(tag),
        );
      },
      error: (err: any) => {
        if (err) {
          this.messageService.error(err.error.message || err.message);
        }
      },
    });
  }

  public sendForm(): void {
    this.emitOk.next({
      form: {
        ...this.form.value,
        tags: this.selectedTags.map((t: any) => t.id),
      },
      selectedProducts: this.selectedProducts,
      reminders: this.reminders,
    });
  }

  public openCreateTagModal(tag?: any): void {
    const modal = this.modalService.create({
      nzContent: AddTagComponent,
      nzTitle: tag?.nome || 'Adicionar tag',
      nzCancelText: null,
      nzData: { tag, organizations: this.data.organizations },
      nzOkText: null,
    });

    modal.componentInstance?.emitOk.subscribe((value) => {
      if (value) {
        this.createTag(value, tag?.id, modal);
      }
    });
  }

  public createTag(
    payload: any,
    tagId?: number,
    modalInstance?: NzModalRef,
  ): void {
    this.kanbanService.createTag(payload, tagId).subscribe({
      next: (res) => {
        this.getTags();
        this.messageService.success(res?.message);
        modalInstance?.close();
      },
      error: (err: any) => {
        if (err) {
          this.messageService.error(err.error.message || err.message);
        }
      },
    });
  }

  public deleteTag(tag: any): void {
    this.kanbanService
      .deleteTag({ tagId: tag.id, orgId: tag.id_organization })
      .subscribe({
        next: (res) => {
          this.getTags();
          this.messageService.success(res?.message);
        },
        error: (err: any) => {
          if (err) {
            this.messageService.error(err.error.message || err.message);
          }
        },
      });
  }

  private getNotes(): void {
    this.kanbanService.getNotes({ cardId: this.cardData.id }).subscribe({
      next: (res) => {
        this.notes = res.data;
        this.notes = this.notes.map((note) => {
          const user = this.data.users.find(
            (user: any) => user.id === note.user_autor,
          );
          if (user) {
            return {
              ...note,
              user: user,
            };
          } else {
            return note;
          }
        });
      },
      error: (err: any) => {
        if (err) {
          this.messageService.error(err.error.message || err.message);
        }
      },
    });
  }

  private getTasks(): void {
    this.kanbanService.getTasks({ cardId: this.cardData.id }).subscribe({
      next: (res) => {
        this.tasks = res.data.tasks;
        this.reminders = res.data.lembretes;
        this.tasks = this.tasks.sort((a, b) => a.is_concluida - b.is_concluida);
      },
      error: (err: any) => {
        if (err) {
          this.messageService.error(err.error.message || err.message);
        }
      },
    });
  }

  public openTaskModal(task?: any): void {
    const modal = this.modalService.create({
      nzTitle: 'Adicionar Tarefa',
      nzContent: AddTaskComponent,
      nzData: { task, users: this.data.users },
      nzCancelText: null,
      nzOkText: null,
      nzFooter: null,
    });

    modal.componentInstance?.emitOk.subscribe((value) => {
      if (value) {
        this.kanbanService
          .addTask(
            { cardId: this.cardData.id, ...value },
            task?.id,
            task?.is_concluida,
          )
          .subscribe({
            next: (res) => {
              this.getTasks();
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

  public markTaskCompletion(task: any, complete: boolean) {
    this.kanbanService
      .addTask(
        {
          cardId: this.data.cardId,
          name: task.nome,
          description: task.texto,
          time: task.prazo,
          isDeadline: task.date_is_due,
          responsibles: task.responsaveis,
        },
        task.id,
        complete,
      )
      .subscribe({
        next: (res) => {
          this.getCardData();
        },
        error: (err: any) => {
          if (err) {
            this.messageService.error(err.error.message || err.message);
          }
        },
      });
  }

  public deleteTask(taskId: number): void {
    this.kanbanService
      .deleteTask({
        cardId: this.data.cardId,
        taskId,
      })
      .subscribe({
        next: (res) => {
          this.getCardData();
          this.messageService.success(res?.message);
        },
        error: (err: any) => {
          if (err) {
            this.messageService.error(err.error.message || err.message);
          }
        },
      });
  }

  public addNote(): void {
    this.kanbanService
      .addNote({
        cardId: this.cardData.id,
        text: this.noteForm.get('text')?.value,
      })
      .subscribe({
        next: (res) => {
          this.getNotes();
          this.noteForm.reset();
          this.messageService.success(res?.message);
        },
        error: (err: any) => {
          if (err) {
            this.messageService.error(err.error.message || err.message);
          }
        },
      });
  }

  public deleteRelation(relation: any): void {
    if (this.isEditing) {
      this.kanbanService
        .deleteProductCardRelation(
          { cardId: this.cardData.id, productId: relation.id_produto },
          relation.id_relacao,
        )
        .subscribe({
          next: (res) => {
            this.getCardData();
            this.messageService.success(res?.message);
          },
          error: (err: any) => {
            if (err) {
              this.messageService.error(err.error.message || err.message);
            }
          },
        });
    } else {
      this.selectedProducts = this.selectedProducts.filter(
        (r: any) => r.product !== relation.product,
      );
    }
  }

  public getProductValueSum(): number {
    let sum = 0;
    this.selectedProducts.forEach((p: any) => {
      sum += p.valor;
    });
    return sum;
  }

  public openAddProductModal(relation?: any): void {
    const modal = this.modalService.create({
      nzTitle: 'Adicionar Produto ao Cartão',
      nzContent: AddProductComponent,
      nzData: {
        relation: relation,
        unities: this.data.unities,
      },
      nzCancelText: null,
      nzOkText: null,
      nzFooter: null,
    });

    modal.componentInstance?.emitOk.subscribe((value) => {
      if (value) {
        if (this.isEditing) {
          this.kanbanService
            .createProductCardRelation(
              { card_id: this.cardData.id, ...value.form },
              relation?.id_relacao,
            )
            .subscribe({
              next: (res) => {
                this.getCardData();
                this.messageService.success(res?.message);
                modal.close();
              },
              error: (err: any) => {
                if (err) {
                  this.messageService.error(err.error.message || err.message);
                }
              },
            });
        } else {
          const payload = value.product;

          payload.valor = value.form.value;
          payload.product = value.form.product;

          this.selectedProducts.push(payload);
          modal.close();
        }
      }
    });
  }

  public getReminderFromTask(task: any) {
    return this.reminders.filter((r) => r.id_alvo === task.id);
  }

  public openAddReminderModal(item: any, isCard: boolean = false): void {
    const modal = this.modalService.create({
      nzTitle: 'Adicionar Lembrete à Tarefa',
      nzContent: AddReminderComponent,
      nzData: {
        item: item ? item : {prazo: this.form.get('time')?.value},
        targetId: item?.id,
        cardId: this.cardData?.id,
        reminders: isCard
          ? (item ? item?.list_reminder : this.reminders)
          : this.getReminderFromTask(item) || [],
        itemType: isCard ? 'C' : 'T',
      },
      nzCancelText: null,
      nzOkText: null,
      nzFooter: null,
      nzClosable: false,
    });

    modal.afterClose.subscribe(() => {
      isCard ? (item ? this.getCardData() : null) : this.getTasks();
    });

    modal.componentInstance?.emitOk.subscribe((value) => {
      if(value) {
        this.reminders = value.reminders;

        modal.close();
      }
    });
  }


  public openAddContactModal(): void {
    const modal = this.modalService.create({
      nzTitle: 'Adicionar Contatos ao Cartão',
      nzContent: AddContactComponent,
      nzData: {
        selectedContacts: this.cardData?.list_contatos,
      },
      nzCancelText: null,
      nzOkText: null,
      nzFooter: null,
    });

    modal.componentInstance?.emitOk.subscribe((value) => {
      if (value) {
        this.form.get('contacts')?.setValue(value.form.contacts);
        this.cardData = {
          list_contatos: value.selectedContacts,
        } as ICard;
        modal.close();
      }
    });
  }

  public removeContact(contact: any): void {
    const filteredContact = this.cardData.list_contatos?.filter(
      (c: any) => c.id !== contact.id,
    );

    this.form.get('contacts')?.setValue(filteredContact?.map((c: any) => c.id));
    this.cardData = {
      list_contatos: filteredContact,
    } as ICard;
  }

  private moveCard(
    stepId: number,
    newStepId: number,
    newListOrder: number[],
  ): void {
    this.kanbanService
      .moveCard({
        cardId: this.data.cardId,
        stepId,
        newStepId,
        newListOrder,
      })
      .subscribe({
        error: (err: any) => {
          if (err) {
            this.messageService.error(err.error.message || err.message);
          }
        },
      });
  }



  public getDisplayName(contact: any): string {
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

  public getTimeDiffFromNow(time: string): number {
    const taskEnd = new Date(time);
    const now = new Date();

    return (taskEnd.getTime() - now.getTime()) / 1000 / 60;
  }
}
