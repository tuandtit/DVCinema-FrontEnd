import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Seat } from '../models/seat/seat.model';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket: WebSocket | null = null;
  private subject: Subject<Seat[]> | null = null;

  constructor() {}

  connect(url: string): Subject<Seat[]> {
    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)
    ) {
      this.disconnect();
    }

    this.subject = new Subject<Seat[]>();
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      console.log('WebSocket connected to:', url);
    };

    this.socket.onmessage = (event) => {
      try {
        const seatUpdate = JSON.parse(event.data) as Seat[];
        console.log('WebSocket received:', seatUpdate);
        this.subject?.next(seatUpdate);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
        this.subject?.error(error);
      }
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.subject?.error(error);
    };

    this.socket.onclose = () => {
      console.log('WebSocket connection closed');
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
