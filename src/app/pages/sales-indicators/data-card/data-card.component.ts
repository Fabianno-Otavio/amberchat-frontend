import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { NzCardComponent } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import {
  ApexChart,
  ApexDataLabels,
  ApexLegend,
  ApexNonAxisChartSeries,
  NgApexchartsModule,
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  legend: ApexLegend;
  colors: any[];
};

@Component({
  selector: 'app-data-card',
  standalone: true,
  imports: [
    NzCardComponent,
    NgApexchartsModule,
    NzIconModule,
    NzGridModule,
    DecimalPipe,
  ],
  templateUrl: './data-card.component.html',
  styleUrl: './data-card.component.scss',
})
export class DataCardComponent implements OnInit, OnChanges {
  @Input() public title!: string;
  @Input() public icon: string = 'pie-chart';
  @Input() public value!: number;
  @Input() public percentage!: number;
  @Input() public color: string = '#0F0';
  @Input() public showChart: boolean = true;
  @Input() public isCurrency: boolean = false;

  public chartOptions!: ChartOptions;

  ngOnInit(): void {
    this.setChartOptions();
  }

  ngOnChanges(): void {
    this.setChartOptions();
  }

  private setChartOptions(): void {
    this.chartOptions = {
      series: [this.percentage, 100 - this.percentage],
      colors: [this.color, '#DDD'],
      chart: {
        type: 'donut',
        height: 170,
        width: 150,
      },
      legend: {
        show: false,
      },
      dataLabels: {
        enabled: false,
      },
    };
  }
}
