import { Component, EventEmitter, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-ai-assistant',
  imports: [],
  templateUrl: './ai-assistant.component.html',
  styleUrl: './ai-assistant.component.css'
})
export class AiAssistantComponent {
  @Output() close = new EventEmitter<void>();

  closeChat() {
    this.close.emit();
  }



}
