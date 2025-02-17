import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ISetupScreen } from '../../../shared/interfaces/setup-screen.interface';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { Subject } from 'rxjs';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [
    NzButtonModule,
    NzDatePickerModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    ReactiveFormsModule,
  ],
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.scss',
})
export class FilterComponent implements OnInit, OnDestroy {
  @Input() public filterSelects!: ISetupScreen;
  @Output() public onCancel: EventEmitter<string> = new EventEmitter();
  @Output() public onOk: EventEmitter<any> = new EventEmitter();

  private readonly formBuilder = inject(FormBuilder);
  private readonly unsubscribe = new Subject();

  public filterForm!: FormGroup;
  public statuses = [
    {
      code: 0,
      name: 'Automático',
    },
    {
      code: 1,
      name: 'Aguardando',
    },
    {
      code: 2,
      name: 'Manual',
    },
    {
      code: 5,
      name: 'Fora de hora',
    },
  ];

  ngOnInit(): void {
    this.buildForm();
  }

  private buildForm(): void {
    this.filterForm = this.formBuilder.group({
      channels: [],
      status: '',
      users: [],
      sectors: [],
      tags: [],
      service_date_range: this.formBuilder.group({
        initial: '',
        final: '',
      }),
      register_date_range: this.formBuilder.group({
        initial: '',
        final: '',
      }),
    });
  }

  public handleOk(): void {
    this.onOk.emit(this.filterForm.value);
  }

  public handleCancel(): void {
    this.onCancel.emit('cancel');
  }

  ngOnDestroy(): void {
    this.unsubscribe.next(true);
    this.unsubscribe.unsubscribe();
  }
}
