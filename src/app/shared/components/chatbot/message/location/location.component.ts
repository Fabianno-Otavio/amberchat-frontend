import { Component, Input, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-location',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './location.component.html',
  styleUrl: './location.component.scss',
})
export class LocationComponent implements OnInit {
  @Input() public locationData!: any;

  public locationUrl!: string;

  ngOnInit(): void {
    this.locationUrl = `https://www.google.com.ph/maps/dir/${this.locationData?.latitude},${this.locationData?.longitude}`;
  }
}
