import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFlexModule } from 'ng-zorro-antd/flex';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { BehaviorSubject } from 'rxjs';
import { KanbanService } from '../../../kanban.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzIconModule } from 'ng-zorro-antd/icon';
import {
  formatPhoneNumber,
  isNameEqualsPhone,
} from '../../../../../shared/utils/phone.utils';
import { NzEllipsisPipe } from 'ng-zorro-antd/pipes';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { LoadingComponent } from '../../../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-add-contact',
  standalone: true,
  imports: [
    NzDividerModule,
    NzButtonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzFlexModule,
    NzSelectModule,
    NzIconModule,
    NzEllipsisPipe,
    NzToolTipModule,
    LoadingComponent,
  ],
  templateUrl: './add-contact.component.html',
  styleUrl: './add-contact.component.scss',
})
export class AddContactComponent {
  public form!: FormGroup;
  public contacts: any[] = [];
  public allContacts: any[] = [];

  private readonly fb = inject(FormBuilder);
  private readonly kanbanService = inject(KanbanService);
  private readonly messageService = inject(NzMessageService);
  public readonly data: {
    selectedContacts: any;
  } = inject(NZ_MODAL_DATA);

  public formatPhoneNumber = formatPhoneNumber;

  public emitOk = new BehaviorSubject<any>(null);

  public selectedContacts = [];

  constructor() {
    this.getContacts('');
    this.buildForm();
  }

  private buildForm(): void {
    this.form = this.fb.group({
      contacts: [
        this.data?.selectedContacts?.map((c: any) => c.id) || [],
        Validators.required,
      ],
    });

    this.form.get('contacts')?.valueChanges.subscribe((value) => {
      this.verifyContactList();
      this.selectedContacts = value.map((v: any) => {
        return this.allContacts.find((c: any) => c.id === v);
      });
    });
  }

  private verifyContactList(): void {
    if (this.data.selectedContacts) {
      this.data.selectedContacts.forEach((c: any) => {
        if (
          this.allContacts.findIndex((contact) => contact.id === c.id) === -1
        ) {
          this.contacts.push(c);
        }
      });
    }
  }

  public getContacts(query: string): void {
    this.kanbanService.getContacts(query).subscribe({
      next: (res) => {
        this.contacts = res.data.map((c: any) => c.json_contato);
        this.allContacts.push(
          ...this.contacts.filter((c: any) => !this.allContacts.includes(c)),
        );

        this.verifyContactList();
      },
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
}
