import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { IStep } from '../../kanban.component';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';

@Component({
  selector: 'app-add-step',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NzInputModule,
    NzFormModule,
    NzSelectModule,
    NzCheckboxModule,
  ],
  templateUrl: './add-step.component.html',
  styleUrl: './add-step.component.scss',
})
export class AddStepComponent {
  public form!: FormGroup;

  private readonly fb = inject(FormBuilder);
  private readonly stepData: IStep = inject(NZ_MODAL_DATA);

  constructor() {
    this.buildForm();
  }

  private buildForm(): void {
    this.form = this.fb.group({
      name: [this.stepData?.nome || '', Validators.required],
      color: this.stepData?.rgb || '#039BE5',
      lastStep: this.stepData?.is_conclusivo || false,
    });
  }
}
