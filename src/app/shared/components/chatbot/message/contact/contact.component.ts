import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { ContactDetailComponent } from './contact-detail/contact-detail.component';
import { NzCardComponent } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [NzGridModule, NzCardComponent, CommonModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent {
  @Input() contact!: any[];

  public readonly modalService = inject(NzModalService);

  public openContactDetailModal(): void {
    this.modalService.create({
      nzTitle: 'Visualizar Contato',
      nzContent: ContactDetailComponent,
      nzData: this.contact,
      nzCancelText: null,
    });
  }
}
