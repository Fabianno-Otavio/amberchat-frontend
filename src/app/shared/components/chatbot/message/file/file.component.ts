import { HttpClient } from '@angular/common/http';
import { Component, inject, Input } from '@angular/core';
import { NzButtonComponent, NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { saveAs } from 'file-saver';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzEllipsisPipe } from 'ng-zorro-antd/pipes';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

@Component({
  selector: 'app-file',
  standalone: true,
  imports: [NzIconModule, NzButtonComponent, NzGridModule, NzTypographyModule, NzToolTipModule],
  templateUrl: './file.component.html',
  styleUrl: './file.component.scss',
})
export class FileComponent {
  @Input() public src!: string;
  @Input() public fileName!: string;
  @Input() public fileType!: string;

  private http = inject(HttpClient);

  public downloadFile(): void {
    this.http.get(this.src, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        saveAs(blob, this.fileName);
      },
    });
  }
}
