import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-notifications',
  imports: [],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent {
 @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }
}
