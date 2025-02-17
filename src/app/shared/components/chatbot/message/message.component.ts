import { FileComponent } from './file/file.component';
import { CommonModule, DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { NzCardComponent } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzImageModule } from 'ng-zorro-antd/image';
import { AudioPlayerComponent } from './audio-player/audio-player.component';
import { ContactComponent } from './contact/contact.component';
import { LocationComponent } from './location/location.component';

export enum MessageType {
  chat,
  audio,
  ptt,
  image,
  video,
  document,
  sticker,
  location,
  vcard,
  multi_vcard,
  revoked,
  unknown,
  call_log
}

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [
    AudioPlayerComponent,
    CommonModule,
    ContactComponent,
    DatePipe,
    FileComponent,
    LocationComponent,
    NzCardComponent,
    NzGridModule,
    NzIconModule,
    NzImageModule,
  ],
  styleUrl: './message.component.scss',
  templateUrl: './message.component.html',
})
export class MessageComponent {
  @Input() public isReply: boolean = false;

  @Input() public senderImage!: string;

  @Input() public isSentByMe: boolean = true;
  @Input() public isSystemMessage:boolean = false;

  @Input() public mediaData!: string;
  @Input() public mediaType!: string;
  @Input() public mediaName!: string;

  @Input() public messageStatus: number = 0;
  @Input() public messageTime: string = '';
  @Input() public messageType!: MessageType;

  @Input() public contactData!: any;

  @Input() public locationData!: any;
}
