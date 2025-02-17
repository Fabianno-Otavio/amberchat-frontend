import { AddFunnelComponent } from './modals/add-funnel/add-funnel.component';
import { AddStepComponent } from './modals/add-step/add-step.component';
import { AddCardComponent } from './modals/add-card/add-card.component';
import { Component, inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { KanbanService } from './kanban.service';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardComponent } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzFlexModule } from 'ng-zorro-antd/flex';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTagModule } from 'ng-zorro-antd/tag';
import {
  CdkDropList,
  CdkDrag,
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  CdkDragHandle,
} from '@angular/cdk/drag-drop';
import { getContrast } from '../../shared/utils/color';
import { UserStore } from './user.store';
import { ActivatedRoute } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzEllipsisPipe } from 'ng-zorro-antd/pipes';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { getFirstLetters } from '../../shared/utils/string.utils';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { containsAny } from '../../shared/utils/functions.utils';
import { DecimalPipe } from '@angular/common';

export interface ICard {
  id: number;
  id_anterior: number;
  id_proximo: number;
  list_responsaveis?: string[];
  list_contatos?: any[];
  list_products?: any[];
  list_tags?: number[];
  list_reminder?: any[];
  list_tag_complete?: any[];
  nome: string;
  observacoes: string;
  prazo?: any;
  prioridade: number;
  qtd_contatos: number;
  tasks_done: number;
  tasks_total: number;
  prod_value: number;
  is_prazo_marcado: boolean;
}

export interface IStep {
  id: number;
  list_cards: ICard[];
  nome: string;
  order_cards: any;
  rgb: string;
  is_conclusivo: boolean;
}

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [
    LoadingComponent,
    CdkDrag,
    CdkDropList,
    NzAvatarModule,
    NzButtonModule,
    NzCardComponent,
    NzDividerModule,
    NzDropDownModule,
    NzFlexModule,
    NzFormModule,
    NzGridModule,
    NzIconModule,
    NzInputModule,
    NzPopconfirmModule,
    NzProgressModule,
    NzSelectModule,
    NzTagModule,
    ReactiveFormsModule,
    NzEllipsisPipe,
    NzToolTipModule,
    NzTypographyModule,
    CdkDragHandle,
    DecimalPipe,
  ],
  providers: [NzModalService],
  templateUrl: './kanban.component.html',
  styleUrl: './kanban.component.scss',
})
export class KanbanComponent implements OnDestroy {
  public steps!: IStep[];
  public stepIdList!: string[];

  public form!: FormGroup;
  public setupData: any;

  public movingCard!: ICard;
  public movingStep!: IStep;

  public getContrast = getContrast;
  public getFirstLetters = getFirstLetters;

  public currentFiltering: string[] = [];

  private readonly modalService = inject(NzModalService);
  private readonly kanbanService = inject(KanbanService);
  private readonly fb = inject(FormBuilder);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly messageService = inject(NzMessageService);

  private userStore = inject(UserStore);

  constructor() {
    this.getUserData();
    this.buildForm();
    this.setupScreen();
    this.connectToWS();
  }

  private connectToWS(): void {
    this.kanbanService.connectToKanbanWebSocket().subscribe({
      next: (res: any) => {
        const currentFunnel = this.form.get('funnel')?.value;

        this.getFunnel(currentFunnel);
      },
      error: (err: any) => {
        if (err?.message) {
          this.messageService.error(err.message);
        }
      },
    });
  }

  private getUserData(): void {
    this.activatedRoute.queryParams.subscribe({
      next: (param) => {
        const systemId = param['systemId'] || '';
        this.userStore.setSystemId(systemId);

        const userId = param['userId'] || '';
        this.userStore.setUserId(userId);
      },
    });
  }

  ngOnDestroy(): void {
    this.kanbanService.disconnectKanbanWebSocket();
  }

  private buildForm(): void {
    this.form = this.fb.group({
      organization: null,
      funnel: '',
      statuses: null,
      responsibles: null,
      query: '',
      tags: null,
    });

    this.form.get('organization')?.valueChanges.subscribe({
      next: (value: string) => {
        this.setupData.funnels = this.setupData.funnels.filter((f: any) =>
          f.organizations.includes(value),
        );
      },
    });

    this.form.get('funnel')?.valueChanges.subscribe({
      next: (value: string) => {
        if (value) {
          this.getFunnel(value);
          localStorage.setItem('last-funnel', value);
        } else {
          this.steps = [];
        }
      },
    });

    let lastValue: any;

    this.form?.valueChanges.subscribe({
      next: (value) => {
        if (lastValue !== value) {
          Object.keys(value).forEach((key) => {
            if (lastValue) {
              if (value[key] !== lastValue[key]) {
                if (value[key].length > 0) {
                  this.currentFiltering.push(key);
                } else {
                  this.currentFiltering = this.currentFiltering.filter(
                    (k) => k !== key,
                  );
                }
              }
            }
          });
        }

        lastValue = value;
      },
    });
  }

  public showCard(card: ICard): boolean {
    const formValue = this.form.value;

    let show = true;
    if (this.currentFiltering.includes('query')) {
      if (show) {
        show = card.nome
          ?.toLowerCase()
          .includes(formValue.query?.toLowerCase());
      }
    }

    if (this.currentFiltering.includes('responsibles')) {
      if (show) {
        show = containsAny(
          card.list_responsaveis || [],
          formValue.responsibles,
        );
      }
    }

    if (this.currentFiltering.includes('tags')) {
      if (show) {
        show = containsAny(card.list_tags || [], formValue.tags);
      }
    }

    return show;
  }

  public numberOfCardsShown(cardList: ICard[]) {
    let amount = 0;

    cardList.forEach((c) => {
      if (this.showCard(c)) {
        amount++;
      }
    });

    return amount;
  }

  private selectFirstFunnel(): void {
    const lastFunnel = localStorage.getItem('last-funnel');

    if (lastFunnel) {
      this.form.get('funnel')?.patchValue(parseInt(lastFunnel));
    } else if (this.setupData?.funnels.length > 0) {
      this.form.get('funnel')?.patchValue(this.setupData.funnels[0].id);
    }

    const currentFunnel = this.form.get('funnel')?.value;

    const currentFunnelOrg = this.setupData.funnels.find(
      (f: any) => f.id === currentFunnel,
    )?.organizations[0];

    this.form.get('organization')?.patchValue(currentFunnelOrg);

    this.form.updateValueAndValidity();
  }

  drop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }

  dropCard(event: CdkDragDrop<any[]>, card: any) {
    const currentStep = this.steps.find(
      (s) => s.id === parseInt(event.previousContainer.id),
    );
    const newStep = this.steps.find(
      (s) => s.id === parseInt(event.container.id),
    );

    if (currentStep && newStep) {
      const cardIndex = currentStep.list_cards.findIndex(
        (c) => c.id === card.id,
      );
      const lastIndex = newStep.list_cards.length;

      if (event.previousContainer === event.container) {
        moveItemInArray(
          event.container.data,
          event.previousIndex,
          event.currentIndex,
        );
      } else {
        transferArrayItem(
          event.previousContainer.data,
          event.container.data,
          cardIndex,
          lastIndex,
        );
      }
    }
  }

  dropCards(event: CdkDragDrop<string[]>) {
    moveItemInArray(
      event.container.data,
      event.previousIndex,
      event.currentIndex,
    );
  }

  private setupScreen(): void {
    this.kanbanService.setupScreen().subscribe({
      next: (res) => {
        this.setupData = res.data;

        this.selectFirstFunnel();
      },
      error: (err: any) => {
        if (err?.message) {
          this.messageService.error(err.message);
        }
      },
    });
  }

  public getStepValueSum(step: IStep): number {
    let sum = 0;

    step.list_cards.forEach((c) => {
      if (this.showCard(c)) {
        sum += c.prod_value;
      }
    });
    return sum;
  }

  private getFunnel(funnelId: string): void {
    this.kanbanService.getFunnel({ funnelId }).subscribe({
      next: (res) => {
        const newStepList: IStep[] = [];
        res.data.current_funnel_order_steps.forEach((stepId: number) => {
          const idx = res.data.current_funnel_steps.findIndex(
            (s: IStep) => s.id === stepId,
          );

          if (idx !== -1) {
            newStepList.push(res.data.current_funnel_steps[idx]);
          }
        });

        this.steps = newStepList;
        this.refreshStepIdList();

        this.steps.map((step) => {
          if (step.list_cards.length > 0) {
            const newCardList: ICard[] = [];
            step.order_cards?.forEach((id: number) => {
              const idx = step.list_cards.findIndex((c) => c.id === id);

              if (idx !== -1) {
                newCardList.push(step.list_cards[idx]);
              }
            });

            step.list_cards = newCardList;

            step.list_cards.forEach((card) => {
              card.list_tag_complete = [];
              card.list_tags?.forEach((tagId) => {
                const tag = this.setupData.tags.find(
                  (tag: any) => tag.id === tagId,
                );
                if (tag) {
                  card.list_tag_complete?.push(tag);
                }
              });
            });
          }
        });
      },
      error: (err: any) => {
        if (err?.message) {
          this.messageService.error(err.message);
        }
      },
    });
  }

  public refreshStepIdList(): void {
    this.stepIdList = this.steps.map((step) => step.id.toString());
  }

  public openCardModal(
    step: IStep,
    position: 'top' | 'bottom' = 'bottom',
    card?: ICard,
  ): void {
    const modal = this.modalService.create({
      nzContent: AddCardComponent,
      nzTitle: card?.nome || 'Adicionar Cartão',
      nzData: {
        cardId: card?.id,
        organizations: this.setupData.organizations,
        users: this.setupData.users,
        unities: this.setupData.unidades,
        steps: this.steps,
        currentStep: step,
      },
      nzCancelText: null,
      nzWidth: '95%',
      nzOkText: null,
      nzFooter: null,
      nzOnCancel: (c) => {
        this.getFunnel(this.form.get('funnel')?.value);
      },
    });

    modal.componentInstance?.emitOk.subscribe((value) => {
      if (value) {
        this.createCard(value, step.id, card?.id);
        modal.close();
      }
    });
  }

  private createCard(payload: any, stepId: number, cardId?: number): void {
    this.kanbanService
      .createCard({ stepId, ...payload.form }, cardId)
      .subscribe({
        next: (res) => {
          const currentFunnel = this.form.get('funnel')?.value;

          this.getFunnel(currentFunnel);
          this.messageService.success(res?.message);

          if (!cardId) {
            payload.selectedProducts.forEach((p: any) => {
              this.addProductsToCard(res.id, p);
            });

            payload.reminders.forEach((r: any) => {
              this.addReminderToCard(res.id, r);
            })
          }
        },
        error: (err: any) => {
          if (err?.message) {
            this.messageService.error(err.message);
          }
        },
      });
  }


  public addReminderToCard(cardId: number, payload: any): void {
    this.kanbanService
      .createReminder(
        { targetId: cardId , ...payload },
        cardId,
      )
      .subscribe({
        next: (res) => {
          this.messageService.success(res?.message);
          // if (this.data.itemType === 'T') {
          //   this.getReminders();
          // } else {
          //   this.getCardReminder();
          // }
        },
        error: (err: any) => {
          if (err) {
            this.messageService.error(err.error.message || err.message);
          }
        },
      });
  }

  public addProductsToCard(cardId: string, value: any): void {
    this.kanbanService
      .createProductCardRelation({ card_id: cardId, ...value })
      .subscribe({
        error: (err: any) => {
          if (err) {
            this.messageService.error(err.error.message || err.message);
          }
        },
      });
  }

  public deleteCard(step: IStep, card: ICard) {
    this.kanbanService.deleteCard(step.id, card.id).subscribe({
      next: (res) => {
        const currentFunnel = this.form.get('funnel')?.value;

        this.getFunnel(currentFunnel);
        this.messageService.success(res?.message);
      },
      error: (err: any) => {
        if (err?.message) {
          this.messageService.error(err.message);
        }
      },
    });
  }

  public openStepModal(step?: IStep): void {
    const modal = this.modalService.create({
      nzContent: AddStepComponent,
      nzTitle: step?.nome || 'Adicionar Etapa',
      nzData: step,
      nzCancelText: null,
      nzOkDisabled: true,
      nzOnOk: (c) => {
        const stepData = c.form?.value;

        this.createStep(stepData, step?.id);
      },
    });

    modal.afterOpen.subscribe({
      next: () => {
        modal.updateConfig({
          nzOkDisabled: modal.componentInstance?.form?.invalid,
        });

        modal.componentInstance?.form.valueChanges.subscribe({
          next: () => {
            modal.updateConfig({
              nzOkDisabled: modal.componentInstance?.form?.invalid,
            });
          },
        });
      },
    });
  }

  private createStep(payload: any, stepId?: number): void {
    const currentFunnel = this.form.get('funnel')?.value;

    this.kanbanService
      .createStep({ funnelId: currentFunnel, ...payload }, stepId)
      .subscribe({
        next: (res) => {
          this.getFunnel(currentFunnel);
          this.messageService.success(res?.message);
        },
        error: (err: any) => {
          if (err?.message) {
            this.messageService.error(err.message);
          }
        },
      });
  }

  public deleteStep(step: IStep): void {
    const currentFunnel = this.form.get('funnel')?.value;

    this.kanbanService.deleteStep(step.id, currentFunnel).subscribe({
      next: (res) => {
        this.getFunnel(currentFunnel);
        this.messageService.success(res?.message);
      },
      error: (err: any) => {
        if (err?.message) {
          this.messageService.error(err.message);
        }
      },
    });
  }

  public openAddFunnelModal(funnel?: any): void {
    const modal = this.modalService.create({
      nzContent: AddFunnelComponent,
      nzTitle: funnel?.nome || 'Adicionar Funil',
      nzData: { funnel, organizations: this.setupData.organizations },
      nzCancelText: null,
      nzOkDisabled: true,
      nzOnOk: (c) => {
        const payload = c.form.value;

        this.kanbanService.createFunnel(payload, funnel?.id).subscribe({
          next: (res) => {
            this.setupScreen();
            this.messageService.success(res?.message);
          },
          error: (err: any) => {
            if (err?.message) {
              this.messageService.error(err.message);
            }
          },
        });
      },
    });

    modal.afterOpen.subscribe({
      next: () => {
        modal.updateConfig({
          nzOkDisabled: modal.componentInstance?.form?.invalid,
        });

        modal.componentInstance?.form.valueChanges.subscribe({
          next: () => {
            modal.updateConfig({
              nzOkDisabled: modal.componentInstance?.form?.invalid,
            });
          },
        });
      },
    });
  }

  public deleteFunnel(funnelId: string): void {
    this.kanbanService.deleteFunnel({ funnelId }).subscribe({
      next: (res) => {
        this.setupScreen();
        this.messageService.success(res?.message);
      },
      error: (err: any) => {
        if (err?.message) {
          this.messageService.error(err.message);
        }
      },
    });
  }

  public onCardDrop(event: CdkDragDrop<ICard[]>) {
    const stepId = parseInt(event.previousContainer.id);
    const newStepId = parseInt(event.container.id);

    let newListOrder: number[] = [];

    const idx = this.steps.findIndex((s) => s.id === newStepId);

    if (idx !== -1) {
      newListOrder = this.steps[idx].list_cards.map((c) => c.id);
    }

    this.moveCard(stepId, newStepId, newListOrder);
  }

  private moveCard(
    stepId: number,
    newStepId: number,
    newListOrder: number[],
  ): void {
    this.kanbanService
      .moveCard({
        cardId: this.movingCard.id,
        stepId,
        newStepId,
        newListOrder,
      })
      .subscribe({
        next: () => {
          this.getFunnel(this.form.get('funnel')?.value);
        },
        error: (err: any) => {
          if (err?.message) {
            this.messageService.error(err.message);
          }
        },
      });
  }

  public onStepDrop(event: CdkDragDrop<IStep[]>) {
    const newFunnelList = event.container.data.map((s) => s.id);
    this.moveStep(newFunnelList);
  }

  private moveStep(newFunnelList: number[]): void {
    const stepId = this.movingStep.id;
    const funnelId = this.form.get('funnel')?.value;

    this.kanbanService.moveStep({ stepId, funnelId, newFunnelList }).subscribe({
      next: (res) => {
        this.getFunnel(funnelId);
      },
      error: (err: any) => {
        if (err?.message) {
          this.messageService.error(err.message);
        }
      },
    });
  }

  public getUser(id: string): any {
    return this.setupData?.users.find((u: any) => u.id === id) || '';
  }
}
