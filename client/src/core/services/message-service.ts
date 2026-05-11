import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { PaginatedResult } from '../../types/pagination';
import { Message } from '../../types/message';
import { AccountService } from './account-service';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { from, Observable } from 'rxjs';
import { ToastSevice } from './toast-sevice';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private baseUrl = environment.apiUrl;
  private hubUrl = environment.hubUrl;
  private http = inject(HttpClient);
  private accountService = inject(AccountService)
  private hubConnection?: HubConnection;
  messageThread = signal<Message []>([]);
  private toast = inject(ToastSevice);

  getMessages(container: string, pageNumber: number, pageSize: number) {
    let params = new HttpParams();

    params = params.append('pageNumber', pageNumber);
    params = params.append('pageSize', pageSize);
    params = params.append('container', container);

    return this.http.get<PaginatedResult<Message>>(this.baseUrl + 'messages', {params});
  }
   getMessageThread(memberId: string) {
    return this.http.get<Message[]>(this.baseUrl + 'messages/thread/' + memberId);
  }
 

// sendMessage(recipientId: string, content: string): Observable<Message> {
//   return from(
//     this.hubConnection!.invoke<Message>("SendMessage", { recipientId, content })
//   );
// }
  deleteMessage(id: string) {
    return this.http.delete(this.baseUrl + 'messages/' + id);
  }
  // createHubConnection(otherUserId: string) {
  //   const currentUser = this.accountService.currentUser();
  //   if (!currentUser) return;
  //   this.hubConnection = new HubConnectionBuilder()
  //     .withUrl(this.hubUrl + "messages?userId=" + otherUserId, {
  //       accessTokenFactory: () => currentUser.token
  //     })
  //     .withAutomaticReconnect()
  //     .build();
      
  //   this.hubConnection.start().catch(error => console.log(error));

  //   this.hubConnection.on('ReceiveMessageThread', (messages: Message[]) => {
  //     console.log("🔥 Received thread:", messages),
  //     this.messageThread.set(messages.map(message => ({
  //         ...message,
  //         currentUserSender: message.senderId !== otherUserId,
          
  //       })))
  //   });
  //   this.hubConnection.on("newMessage" , (message: Message) =>{
  //     message.currentUserSender = message.senderId === currentUser.id;
  //     this.messageThread.update(messages => [...messages, message])
  //   })
  // }

  createHubConnection(otherUserId: string) {
  const currentUser = this.accountService.currentUser();
  if (!currentUser) return;

  this.hubConnection = new HubConnectionBuilder()
    .withUrl(this.hubUrl + "messages?userId=" + otherUserId, {
      accessTokenFactory: () => currentUser.token
    })
    .withAutomaticReconnect()
    .build();

  this.hubConnection.start().catch(error => console.log(error));

  this.hubConnection.on('ReceiveMessageThread', (messages: Message[]) => {
  console.log('ReceiveMessageThread fired, count:', messages.length); // 👈 add this
  this.messageThread.set(messages.map(message => ({
    ...message,
    currentUserSender: message.senderId === currentUser.id
  })));
});

  this.hubConnection.on('NewMessage', (message: Message) => {
  message.currentUserSender = message.senderId === currentUser.id;
  this.messageThread.update(messages => [...messages, message]);
  if (!message.currentUserSender) {
    this.toast.info(message.senderDisplayName + ' has sent you a new message',
      10000, message.senderImageUrl);
  }
});
}



sendMessage(recipientId: string, content: string) {
  return this.hubConnection?.invoke<Message>('SendMessage', { recipientId, content });
}

  stopHubConnection() {
    if (this.hubConnection?.state === HubConnectionState.Connected) {
      this.hubConnection.stop().catch(error => console.log(error))
    }
  }
  

}
