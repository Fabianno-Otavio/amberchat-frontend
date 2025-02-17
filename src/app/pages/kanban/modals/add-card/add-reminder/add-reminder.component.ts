import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { NzSelectModule, NzSelectOptionInterface } from 'ng-zorro-antd/select';
import { BehaviorSubject, last } from 'rxjs';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { KanbanService } from '../../../kanban.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzFlexModule } from 'ng-zorro-antd/flex';
import { DatePipe, DecimalPipe } from '@angular/common';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';

@Component({
  selector: 'app-add-reminder',
  standalone: true,
  imports: [
    DatePipe,
    NzButtonModule,
    NzDividerModule,
    NzFlexModule,
    NzFormModule,
    NzIconModule,
    NzInputModule,
    NzPopconfirmModule,
    NzRadioModule,
    NzSelectModule,
    NzTableModule,
    NzToolTipModule,
    ReactiveFormsModule,
    NzDatePickerModule,
  ],
  templateUrl: './add-reminder.component.html',
  styleUrl: './add-reminder.component.scss',
})
export class AddReminderComponent {
  public form!: FormGroup;

  private readonly fb = inject(FormBuilder);
  private readonly kanbanService = inject(KanbanService);
  private readonly messageService = inject(NzMessageService);

  public timeDiff = 0;

  public readonly data: {
    item: any;
    targetId?: any;
    cardId: any;
    reminders: any;
    itemType: 'C' | 'T';
  } = inject(NZ_MODAL_DATA);

  public dateOptions: NzSelectOptionInterface[] = [
    {
      label: '10 Minutos',
      value: 10,
    },
    {
      label: '30 Minutos',
      value: 30,
    },
    {
      label: '1 Hora',
      value: 60,
    },
    {
      label: '2 Horas',
      value: 120,
    },
    {
      label: '1 Dia',
      value: 1440,
    },
    {
      label: '2 Dias',
      value: 2880,
    },
    {
      label: 'Digitar tempo',
      value: 'other',
    },
    {
      label: 'Selecionar Data',
      value: 'select',
    },
  ];

  public emitOk = new BehaviorSubject<any>(null);

  public reminders: any[] = [];
  private lastId = 0;

  constructor() {
    this.buildForm();

    this.reminders = this.data.reminders || [];

    this.timeDiff = parseInt(this.getTime().toFixed(0));
  }

  private buildForm(): void {
    this.form = this.fb.group({
      targetType: this.data.itemType,
      time: ['', Validators.required],
      otherTime: '',
      selectedDate: '',
      targetUserType: 'W',
    });
  }

  public addReminder(): void {
    const payload = this.form.value;

    if (payload.time === 'other') {
      payload.time = payload.otherTime;
    }

    if (payload.time === 'select') {
      payload.time = this.getTimeDiffTillTaskEnds(payload.selectedDate);
    }

    delete payload.otherTime;
    delete payload.selectedDate;

    if (this.data.cardId) {
      this.kanbanService
        .createReminder(
          { targetId: this.data.targetId || this.data.cardId, ...payload },
          this.data?.cardId,
        )
        .subscribe({
          next: (res) => {
            this.messageService.success(res?.message);

            if (this.data.itemType === 'T') {
              this.getReminders();
            } else {
              this.getCardReminder();
            }
          },
          error: (err: any) => {
            if (err) {
              this.messageService.error(err.error.message || err.message);
            }
          },
        });
    } else {
      const lastReminders = this.reminders;

      this.reminders = [
        ...lastReminders,
        {
          time: payload.time,
          id_reminder: this.generateRandomId(),
          targetType: this.form.get('targetType')?.value,
          targetUserType: this.form.get('targetUserType')?.value,
        },
      ];
    }
  }

  private generateRandomId(): number {
    this.lastId++;
    return this.lastId;
  }

  private getReminders(): void {
    this.kanbanService.getTasks({ cardId: this.data.cardId }).subscribe({
      next: (res) => {
        this.reminders = res.data.lembretes;
      },
      error: (err: any) => {
        if (err) {
          this.messageService.error(err.error.message || err.message);
        }
      },
    });
  }

  private getCardReminder(): void {
    this.kanbanService.getCardById(this.data.cardId).subscribe({
      next: (res) => {
        this.reminders = res.data.list_reminder;
      },
      error: (err: any) => {
        if (err) {
          this.messageService.error(err.error.message || err.message);
        }
      },
    });
  }

  public deleteReminder(reminder: any): void {
    if (this.data.cardId) {
      this.kanbanService
        .deleteReminder(this.data.cardId, reminder.id_reminder)
        .subscribe({
          next: (res) => {
            this.messageService.success(res?.message);

            if (this.data.itemType === 'T') {
              this.getReminders();
            } else {
              this.getCardReminder();
            }
          },
          error: (err: any) => {
            if (err) {
              this.messageService.error(err.error.message || err.message);
            }
          },
        });
    } else {
      this.reminders = this.reminders.filter(
        (r: any) => r.id_reminder !== reminder.id_reminder,
      );
    }
  }

  public getDisabledDateFunc(): (date: Date) => boolean {
    const prazo = this.data.item.prazo;
    return (date: Date): boolean => {
      return date >= new Date(prazo);
    };
  }

  public formatFromMinutes(time: number): string | undefined {
    if (time < 60) {
      return time.toFixed(0) + ' minutos';
    }
    if (time >= 60 && time < 1440) {
      return (time / 60).toFixed(0) + ' horas';
    }

    if (time >= 1440) {
      return (time / 1440).toFixed(0) + ' dias';
    }

    return;
  }

  public getTimeDiffTillTaskEnds(time: string): number {
    const taskEnd = new Date(this.data.item.prazo);
    const t = new Date(time);
    return parseInt(((taskEnd.getTime() - t.getTime()) / 1000 / 60).toFixed(0));
  }

  public getDateFromMinutesTillEnd(time: number): Date {
    const taskEnd = new Date(this.data.item.prazo);
    const taskEndMinusTime = taskEnd.getTime() / 60000 - time;

    return new Date(taskEndMinusTime * 60000);
  }

  private getTime(): number {
    const taskEnd = new Date(this.data.item.prazo);
    const now = new Date();

    return (taskEnd.getTime() - now.getTime()) / 60000;
  }
}
