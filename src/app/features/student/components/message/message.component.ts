import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-message',
  imports: [CommonModule],
  templateUrl: './message.component.html',
  styleUrl: './message.component.css'
})
export class MessageComponent {
  showMobileChat = false;

  openChat() {
    this.showMobileChat = true;
  }

  closeChat() {
    this.showMobileChat = false;
  }

}
