import { CommonModule, DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzProgressComponent, NzProgressModule } from 'ng-zorro-antd/progress';
import { NzSliderComponent } from 'ng-zorro-antd/slider';

@Component({
  selector: 'app-audio-player',
  standalone: true,
  imports: [NzIconModule, NzProgressModule, DatePipe ,NzGridModule, CommonModule],
  templateUrl: './audio-player.component.html',
  styleUrl: './audio-player.component.scss',
})
export class AudioPlayerComponent {
  @Input() public src = '';
  @Input() public type = '';
  @Input() public image !:string;
  @Input() public isSentByMe!: boolean;

  public currentTime = new Date(1970, 0, 1);
  public audioDuration = new Date(1970, 0, 1);

  public isPaused = true;

  public setCurrentTime(e: any) {
    const t = new Date(1970, 0, 1);
    t.setSeconds(e.target?.currentTime);
    this.currentTime = t;

    if(this.currentTime.getTime() === this.audioDuration.getTime()) {
      this.isPaused = true;

      const u = new Date(1970, 0, 1);
      u.setSeconds(0);
      this.currentTime = u;
    } else {
      this.currentTime = t;
    }
  }

  public setAudioDuration(e: any): void {
    const t = new Date(1970, 0, 1);
    t.setSeconds(e.target?.duration);
    this.audioDuration = t;
  }

  public getPercentage(duration: Date, currentTime: Date): number {
    const durationTimeStamp = duration.getTime() - 10800000 ;
    const currentTimeStamp = currentTime.getTime() - 10800000 ;

    if (durationTimeStamp === 0) {
      return 0;
    }

    const percentage = (currentTimeStamp / durationTimeStamp) * 100;
    return percentage;
  }
}
