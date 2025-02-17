import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  NzDatePickerComponent,
  NzRangePickerComponent,
} from 'ng-zorro-antd/date-picker';

@Component({
  selector: 'app-date-range-filter',
  standalone: true,
  imports: [NzRangePickerComponent, NzDatePickerComponent, FormsModule],
  templateUrl: './date-range-filter.component.html',
  styleUrl: './date-range-filter.component.scss',
})
export class DateRangeFilterComponent implements OnInit {
  private previousDateRange: { i: string; f: string } = JSON.parse(
    localStorage.getItem('filter_custom_period') || '{}',
  );
  public dateRange!: Date[];

  ngOnInit() {
    if (this.previousDateRange.i) {
      const dateI = this.previousDateRange.i;
      const dateF = this.previousDateRange.f;

      const formatedI = new Date(
        parseInt(dateI.slice(4, 9)),
        parseInt(dateI.slice(2, 4)) - 1,
        parseInt(dateI.slice(0, 2)),
      );
      const formatedF = new Date(
        parseInt(dateF.slice(4, 9)),
        parseInt(dateF.slice(2, 4)) - 1,
        parseInt(dateF.slice(0, 2)),
      );

      this.dateRange = [formatedI, formatedF];
    }
  }
}
