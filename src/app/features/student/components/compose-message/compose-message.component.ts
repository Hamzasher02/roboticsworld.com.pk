import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-compose-message',
  imports: [FormsModule],
  templateUrl: './compose-message.component.html',
  styleUrl: './compose-message.component.css'
})
export class ComposeMessageComponent {
  @Input() open = false;
  @Output() close = new EventEmitter<void>();

  teacher = '';
  message = '';

  onBackdropClose() {
    this.close.emit();
  }

  onCancel() {
    this.close.emit();
  }

  onSend() {
    this.close.emit();
  }
}
