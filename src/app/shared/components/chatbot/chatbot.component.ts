import { ChatBotService } from '../../../pages/sales-indicators/modals/chatbot/chatbot.service';
import { CommonModule } from '@angular/common';
import { MessageComponent } from './message/message.component';
import { NzCardComponent } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { NzDividerComponent } from 'ng-zorro-antd/divider';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [NzGridModule, MessageComponent, CommonModule, NzDividerComponent],
  providers: [ChatBotService],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.scss',
})
export class ChatbotComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() public messages!: {
    date: string;
    messages: any[];
  }[];

  @Input() public senderImage!: string;

  @Output() public scrolledToTop = new EventEmitter<boolean>();

  @ViewChild('chatbot') public chatbot!: ElementRef;

  private lastHeight = 0;

  private resizeObserver = new ResizeObserver(() => {
    this.chatbot.nativeElement.scrollTop =
      this.chatbot.nativeElement.scrollHeight - this.lastHeight;
  });

  ngAfterViewInit(): void {
    this.setScrollBottom();
  }

  ngOnChanges(): void {
    if (this.chatbot) {
      this.resizeObserver.unobserve(this.chatbot.nativeElement);
      this.resizeObserver.observe(this.chatbot.nativeElement);
    }
  }

  ngOnDestroy(): void {
    this.resizeObserver.disconnect();
  }

  public onScroll(event: any) {
    if (event.target?.scrollTop === 0) {
      this.scrolledToTop.emit(true);

      this.lastHeight = JSON.parse(
        JSON.stringify(this.chatbot.nativeElement.scrollHeight || ''),
      );
    }
  }

  private setScrollBottom(): void {
    if (this.chatbot) {
      this.chatbot.nativeElement.scrollTop =
        this.chatbot.nativeElement.scrollHeight;
      this.lastHeight = this.chatbot.nativeElement.scrollHeight;
    }
  }
}
