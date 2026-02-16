// ✅ Toast Component for Teacher Module
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from '../../../core/services/toast/toast.service';

@Component({
    selector: 'app-toast',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="toast-container">
      <div
        *ngFor="let toast of toasts$ | async"
        class="toast"
        [ngClass]="'toast-' + toast.type"
        (click)="dismiss(toast.id)"
      >
        <div class="toast-icon">
          <span *ngIf="toast.type === 'success'">✓</span>
          <span *ngIf="toast.type === 'error'">✕</span>
          <span *ngIf="toast.type === 'warning'">⚠</span>
          <span *ngIf="toast.type === 'info'">ℹ</span>
        </div>
        <div class="toast-message">{{ toast.message }}</div>
        <button class="toast-close" (click)="dismiss(toast.id); $event.stopPropagation()">×</button>
      </div>
    </div>
  `,
    styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 380px;
    }

    .toast {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      border-radius: 10px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      animation: slideIn 0.3s ease-out;
      cursor: pointer;
      transition: transform 0.2s, opacity 0.2s;
    }

    .toast:hover {
      transform: translateX(-4px);
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .toast-success {
      background: linear-gradient(135deg, #10B981 0%, #059669 100%);
      color: white;
    }

    .toast-error {
      background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
      color: white;
    }

    .toast-warning {
      background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
      color: white;
    }

    .toast-info {
      background: linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%);
      color: white;
    }

    .toast-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.25);
      font-size: 14px;
      font-weight: bold;
    }

    .toast-message {
      flex: 1;
      font-size: 14px;
      font-weight: 500;
      line-height: 1.4;
    }

    .toast-close {
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.8);
      font-size: 20px;
      cursor: pointer;
      padding: 0;
      line-height: 1;
      transition: color 0.2s;
    }

    .toast-close:hover {
      color: white;
    }
  `]
})
export class ToastComponent {
    private toastService = inject(ToastService);
    toasts$ = this.toastService.toasts;

    dismiss(id: number): void {
        this.toastService.dismiss(id);
    }
}
