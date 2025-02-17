import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { NzDividerComponent } from 'ng-zorro-antd/divider';
import { NzGridModule } from 'ng-zorro-antd/grid';

@Component({
  selector: 'app-contact-detail',
  standalone: true,
  imports: [CommonModule, NzGridModule, NzDividerComponent],
  templateUrl: './contact-detail.component.html',
  styleUrl: './contact-detail.component.scss',
})
export class ContactDetailComponent {
  @Input() contact = inject(NZ_MODAL_DATA);
}
