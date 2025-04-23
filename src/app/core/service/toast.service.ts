import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastSubject = new BehaviorSubject<{ message: string; type: 'success' | 'error' } | null>(
    null
  );
  toast$ = this.toastSubject.asObservable();

  showToast(message: string, type: 'success' | 'error' = 'success'): void {
    this.toastSubject.next({ message, type });
    setTimeout(() => {
      this.hideToast();
    }, 3000); // Ẩn sau 3 giây
  }

  hideToast(): void {
    this.toastSubject.next(null);
  }
}
