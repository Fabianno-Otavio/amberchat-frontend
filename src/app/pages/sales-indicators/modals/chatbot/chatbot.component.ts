import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { ChatbotComponent } from '../../../../shared/components/chatbot/chatbot.component';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { ChatBotService } from './chatbot.service';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzDividerComponent } from 'ng-zorro-antd/divider';
import { last, shareReplay, Subject, take, takeLast, takeUntil } from 'rxjs';

@Component({
  selector: 'app-chatbot-modal',
  standalone: true,
  imports: [ChatbotComponent, NzGridModule, NzDividerComponent],
  providers: [ChatBotService],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.scss',
})
export class ChatbotModalComponent implements OnInit, OnDestroy {
  @Input() public data = inject(NZ_MODAL_DATA);

  public messages!: any;

  public formated: {
    date: string;
    messages: any[];
  }[] = [];

  public currentPage = 1;
  public endOfMessagesReached = false;

  private readonly chatbotService = inject(ChatBotService);

  private readonly unsubscribe$ = new Subject();

  ngOnInit(): void {
    this.getChatMessages();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next(true);
    this.unsubscribe$.unsubscribe();
  }

  public onScrolledToTop(): void {
    if (!this.endOfMessagesReached) {
      this.currentPage++;
      this.getChatMessages();
    }
  }

  private getChatMessages(): void {
    this.chatbotService
      .getMessages(
        this.data.contact.id_contato,
        this.data.channelId,
        this.currentPage,
      )
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (res) => {
          this.messages = res;
          this.formatMessages(res);

          if (
            res.data.json_mensagens &&
            Object.keys(res.data.json_mensagens).length === 0
          ) {
            this.endOfMessagesReached = true;
          } else {
            this.endOfMessagesReached = false;
          }
        },
      });
  }

  private formatMessages(messages: {
    data: {
      number: string;
      json_mensagens: {
        [key: string]: any;
      };
    };
  }): void {
    const newData: {
      date: string;
      messages: any[];
    }[] = this.formated;

    const lastMessage = { ...this.formated[0] };

    Object.keys(messages.data.json_mensagens).map((date: any) => {
      if (date === lastMessage?.date) {
        lastMessage.messages.unshift(
          ...messages.data.json_mensagens[date].reverse(),
        );

        this.formated.shift();
        this.formated.unshift({ ...lastMessage });
      } else {
        newData.unshift({
          date,
          messages: messages.data.json_mensagens[date].reverse(),
        });
      }
    });

    this.formated = [...newData];
  }
}
