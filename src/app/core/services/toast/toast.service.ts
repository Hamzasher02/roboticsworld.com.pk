// ✅ Toast Service for Teacher Module
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
    id: number;
    message: string;
    type: ToastType;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
    private toasts$ = new BehaviorSubject<ToastMessage[]>([]);
    private counter = 0;

    get toasts() {
        return this.toasts$.asObservable();
    }

    show(message: string, type: ToastType = 'info', duration = 3000): void {
        const id = ++this.counter;
        const toast: ToastMessage = { id, message, type };

        this.toasts$.next([...this.toasts$.value, toast]);

        setTimeout(() => this.dismiss(id), duration);
    }

    success(message: string, duration = 3000): void {
        this.show(message, 'success', duration);
    }

    error(message: string, duration = 4000): void {
        this.show(message, 'error', duration);
    }

    warning(message: string, duration = 3500): void {
        this.show(message, 'warning', duration);
    }

    info(message: string, duration = 3000): void {
        this.show(message, 'info', duration);
    }

    dismiss(id: number): void {
        this.toasts$.next(this.toasts$.value.filter((t) => t.id !== id));
    }
}
