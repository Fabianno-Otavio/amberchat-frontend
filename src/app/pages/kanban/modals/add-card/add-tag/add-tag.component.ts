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
import { NzSelectModule } from 'ng-zorro-antd/select';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-add-tag',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NzInputModule,
    NzFormModule,
    NzSelectModule,
    NzButtonModule,
    NzDividerModule,
  ],
  templateUrl: './add-tag.component.html',
  styleUrl: './add-tag.component.scss',
})
export class AddTagComponent {
  public form!: FormGroup;

  private readonly fb = inject(FormBuilder);
  public readonly data: {
    tag: any;
    organizations: any;
  } = inject(NZ_MODAL_DATA);

  public emitOk = new BehaviorSubject<any>(null);

  constructor() {
    this.buildForm();
  }

  private buildForm(): void {
    this.form = this.fb.group({
      name: [this.data?.tag?.nome || '', Validators.required],
      orgId: this.data?.tag?.id_organization || '',
      color: this.data?.tag?.rgb || '',
    });
  }
}
