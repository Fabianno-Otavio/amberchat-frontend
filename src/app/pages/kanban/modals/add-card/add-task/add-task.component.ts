import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
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
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-add-task',
  standalone: true,
  imports: [
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
    NzTableModule,
    NzTabsModule,
    NzDatePickerModule,
    NzToolTipModule,
    NzSwitchModule,
    NzCheckboxModule,
  ],
  templateUrl: './add-task.component.html',
  styleUrl: './add-task.component.scss',
})
export class AddTaskComponent {
  public form!: FormGroup;
  public readonly data: { task?: any; users: any } = inject(NZ_MODAL_DATA);

  private readonly fb = inject(FormBuilder);

  public emitOk = new BehaviorSubject<any>(null);

  constructor() {
    this.buildForm();
  }

  private buildForm(): void {
    this.form = this.fb.group({
      name: [this.data.task?.nome || '', Validators.required],
      time: [this.data.task?.prazo || '', Validators.required],
      description: this.data.task?.texto || '',
      sendMessage: '',
      isDeadline: this.data.task?.is_prazo_marcado || false,
      responsibles: [this.data.task?.responsaveis || [], Validators.required],
    });
  }
}
