import {
  Component,
  effect,
  ElementRef,
  inject,
  OnInit,
  OnDestroy,
  ViewChild,
  model,
} from '@angular/core';

import { MessageService } from '../../../core/services/message-service';
import { AccountService } from '../../../core/services/account-service';
import { DatePipe } from '@angular/common';
import { TimeAgoPipe } from '../../../core/time-ago-pipe';
import { FormsModule } from '@angular/forms';
import { PresenceService } from '../../../core/services/presence-service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-member-messages',
  imports: [DatePipe, TimeAgoPipe, FormsModule],
  templateUrl: './member-messages.html',
  styleUrl: './member-messages.css',
})
export class MemberMessages implements OnInit, OnDestroy {

  @ViewChild('messageEndRef') messageEndRef!: ElementRef;

  private messageService = inject(MessageService);
  private accountService = inject(AccountService);
  protected presence = inject(PresenceService);
  private route = inject(ActivatedRoute);

  protected messageContent = model('');
  protected messageThread = this.messageService.messageThread;

  private otherUserId!: string;

  constructor() {
    effect(() => {
      const currentMessages = this.messageService.messageThread();
      if (currentMessages.length > 0) this.scrollToBottom();
    });
  }

  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe({
      next: params => {
        const otherUserId = params.get('id');
        if (!otherUserId) throw new Error('Cannot connect to hub');

        const currentUserId = this.accountService.currentUser()?.id;
        if (!currentUserId) return;

        this.otherUserId = otherUserId;

        this.messageService.createHubConnection(otherUserId);

      
      }
    });
  }

  ngOnDestroy(): void {
    this.messageService.stopHubConnection();
  }

  // loadMessages(currentUserId: string) {
  //   this.messageService.getMessageThread(this.otherUserId).subscribe({
  //     next: messages => {
  //       this.messageService.messageThread.set(
  //         messages.map(m => ({
  //           ...m,
  //           currentUserSender: m.senderId === currentUserId
  //         }))
  //       );
  //     }
  //   });
  // }

  sendMessage() {
  if (!this.otherUserId || !this.messageContent().trim()) return;

  this.messageService.sendMessage(this.otherUserId, this.messageContent())?.then(() => {
    this.messageContent.set('');
  });
}

  scrollToBottom() {
    setTimeout(() => {
      this.messageEndRef?.nativeElement.scrollIntoView({
        behavior: 'smooth'
      });
    });
  }
}