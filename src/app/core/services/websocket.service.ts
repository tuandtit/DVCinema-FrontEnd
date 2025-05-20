import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket: WebSocket | null = null;
  private subject: Subject<any> | null = null;

  constructor() {}

  connect(url: string): Subject<any> {
    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)
    ) {
      this.disconnect();
    }

    this.subject = new Subject<any>();
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      console.log('WebSocket connected');
    };

    this.socket.onmessage = (event) => {
      this.subject?.next(JSON.parse(event.data));
    };

    this.socket.onerror = (error) => {
      this.subject?.error(error);
    };

    this.socket.onclose = () => {
      this.subject?.complete();
      this.subject = null;
      this.socket = null;
    };

    return this.subject;
  }

  sendMessage(message: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    if (this.subject) {
      this.subject.complete();
      this.subject = null;
    }
  }
}