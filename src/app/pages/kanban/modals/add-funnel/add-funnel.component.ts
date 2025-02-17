import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';

@Component({
  selector: 'app-add-funnel',
  standalone: true,
  imports: [ReactiveFormsModule, NzInputModule, NzFormModule, NzSelectModule],
  templateUrl: './add-funnel.component.html',
  styleUrl: './add-funnel.component.scss',
})
export class AddFunnelComponent {
  public form!: FormGroup;

  private readonly fb = inject(FormBuilder);
  public readonly data: {
    funnel: any;
    organizations: any;
  } = inject(NZ_MODAL_DATA);

  constructor() {
    this.buildForm();
  }

  private buildForm(): void {
    this.form = this.fb.group({
      name: [this.data.funnel?.nome, Validators.required],
      organizations: [this.data.funnel?.organizations, Validators.required],
    });
  }
}
