import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

type CurrencyOpt =
  {
    code: string;
    label: string;
    flagImg: string;   // ✅ image path
    amount: string
  };

type SelectOpt = { value: string; label: string };

@Component({
  selector: 'app-camps-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './camps-form.component.html',
})
export class CampsFormComponent {
  // left: currency
  currencies: CurrencyOpt[] = [
    { code: 'PKR', label: 'PKR', flagImg: 'assets/steam-mind/camp/Pakistan.svg', amount: 'PKR 43,875.76' },
    { code: 'USD', label: 'USD', flagImg: 'assets/steam-mind/camp/United states.svg', amount: 'PKR 43,875.76' }, // screenshot me 2nd bhi PKR show ho raha
  ];

  currency = this.currencies[0].code;

  // left: order details
  rateText = '1 USD = 294.4675 PKR';

  product = {
    title: 'Scratch Explorer: Foundations of Coding ( Online Coding Camp )',
    desc: 'Designed to enhance problem- solving with animation and game creation.',
    price: 'PKR 43,875.66',
    img: 'assets/steam-mind/camp/Rectangle 34626093.svg', // change if needed
  };

  coupon = 'SUMMER50';
  discountText = '50% Off';
  subtotal = 'PKR 21,912.6';
  totalDue = 'PKR 43,875.66';

  // right: form
  email = '';
  timezones: SelectOpt[] = [
    { value: 'Asia/Karachi', label: 'Asia/Karachi (PKT)' },
    { value: 'America/New_York', label: 'America/New_York (ET)' },
  ];
  timezone = this.timezones[0].value;

  batchDates: SelectOpt[] = [
    { value: '2026-01-10', label: '10 Jan 2026' },
    { value: '2026-01-17', label: '17 Jan 2026' },
  ];
  batchDate = this.batchDates[0].value;

  batchTimes: SelectOpt[] = [
    { value: '10:00', label: '10:00 AM' },
    { value: '06:00', label: '06:00 PM' },
  ];
  batchTime = this.batchTimes[0].value;

  cardNumber = '';
  exp = '';
  cvc = '';
  cardHolder = '';

  countries: SelectOpt[] = [
    { value: 'Pakistan', label: 'Pakistan' },
    { value: 'United States', label: 'United States' },
  ];
  country = this.countries[0].value;

  saveInfo = false;

  onBook() {
    // integrate your real payment / booking logic
    console.log('BOOK', {
      currency: this.currency,
      email: this.email,
      timezone: this.timezone,
      batchDate: this.batchDate,
      batchTime: this.batchTime,
    });
  }
}
