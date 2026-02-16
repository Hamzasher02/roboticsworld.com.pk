import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-status-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="show" class="fixed inset-0 z-[20000] flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity" (click)="onClose()"></div>
      
      <!-- Modal Content -->
      <div class="relative w-full max-w-sm p-6 rounded-xl shadow-2xl transform transition-all flex flex-col items-center text-center overflow-hidden"
           [ngClass]="type === 'Success' ? 'bg-green-50 border-2 border-green-100' : 'bg-red-50 border-2 border-red-100'">
        
        <!-- Icon Section -->
        <div class="w-14 h-14 rounded-full flex items-center justify-center mb-4 shadow-sm"
             [ngClass]="type === 'Success' ? 'bg-white text-green-600' : 'bg-white text-red-600'">
          <svg *ngIf="type === 'Success'" class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
          </svg>
          <svg *ngIf="type === 'Error'" class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>

        <!-- Text Content -->
        <h3 class="text-lg font-bold mb-1 tracking-tight" 
            [ngClass]="type === 'Success' ? 'text-green-900' : 'text-red-900'">
          {{ title }}
        </h3>
        <p class="text-sm font-medium leading-relaxed mb-6 px-2" 
           [ngClass]="type === 'Success' ? 'text-green-800' : 'text-red-800'">
          {{ message }}
        </p>

        <!-- Action Button -->
        <button (click)="onClose()"
                class="w-full py-3 px-4 text-white font-bold uppercase tracking-wider text-xs rounded-lg transition-all shadow-md active:scale-[0.98]"
                [ngClass]="type === 'Success' ? 'bg-gray-900 hover:bg-black' : 'bg-red-600 hover:bg-red-700'">
          Got it
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class StatusModalComponent {
  @Input() show = false;
  @Input() title = '';
  @Input() message = '';
  @Input() type: 'Success' | 'Error' = 'Success';
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }
}
