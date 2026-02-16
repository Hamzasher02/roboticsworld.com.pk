import { Component } from '@angular/core';

@Component({
  selector: 'app-demobooked',
  imports: [],
  templateUrl: './demobooked.component.html',
  styleUrl: './demobooked.component.css'
})
export class DemobookedComponent {
showConfirmPopup = true;
showBookedPopup = false;

onAttendConfirm() {
  this.showBookedPopup = true; // keep confirm open behind
}

closeBooked() {
  this.showBookedPopup = false;
}

closeAllPopups() {
  this.showConfirmPopup = false;
  this.showBookedPopup = false;
}

}
