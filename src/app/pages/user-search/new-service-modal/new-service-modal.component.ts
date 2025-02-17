import { Component, inject, Input, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import {
  ISetupScreen,
  ISSChannel,
  ISSSector,
} from '../../../shared/interfaces/setup-screen.interface';
import {
  NZ_MODAL_DATA,
  NzModalComponent,
  NzModalRef,
  NzModalService,
} from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-new-service-modal',
  standalone: true,
  imports: [
    NzButtonModule,
    NzFormModule,
    NzInputModule,
    ReactiveFormsModule,
    NzGridModule,
    NzSelectModule,
  ],
  templateUrl: './new-service-modal.component.html',
  styleUrl: './new-service-modal.component.scss',
})
export class NewServiceModalComponent implements OnInit {
  public readonly filterSelects = inject(NZ_MODAL_DATA);
  private readonly fb: FormBuilder = inject(FormBuilder);
  private readonly modalRef = inject(NzModalRef);

  public form!: FormGroup;
  public sectors: ISSSector[] = [];

  ngOnInit(): void {
    this.buildForm();
  }

  private buildForm(): void {
    this.form = this.fb.group({
      channel: ['', Validators.required],
      sector: ['', Validators.required],
    });

    this.form.get('sector')?.disable();

    this.form.valueChanges.subscribe({
      next: () => {
        if (this.form.invalid) {
          this.form.disable;
          this.modalRef.updateConfig({
            nzOkDisabled: true,
          });
        } else {
          this.form.enable;
          this.modalRef.updateConfig({
            nzOkDisabled: false,
          });
        }
      },
    });

    this.form.get('channel')?.valueChanges.subscribe({
      next: (channel) => {
        this.sectors = this.filterSelects.sectors.filter(
          (sector: ISSSector) =>
            sector.organizationId === channel.organizationid,
        );
        if (this.sectors.length > 0) {
          this.form.get('sector')?.enable();
        } else {
          this.form.get('sector')?.disable();
        }
      },
    });
  }
}
