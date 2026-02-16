// contact-us.component.ts
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

type ContactItem = { icon: string; label: string };

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact-us.component.html',
})
export class ContactUsComponent {
 hero = {
  titleA: "Let’s Build Something",
  titleB: 'Great Together',
  desc:
    "We’re here to answer your questions, discuss your ideas, and help you get started. Reach out today — your journey begins with a message.",
  subTitle: 'Get in Touch',
  subDesc:
    "We’d love to hear from you — whether you have questions, ideas, or just want to say hello.",

  rightImage: 'assets/steam-mind/contact-us/image 6 1.svg',

  bubbleFrame: 'assets/steam-mind/contact-us/Untitled-2 3.svg',

  bubbleIconLeft: 'assets/steam-mind/contact-us/email 1-01 1.svg',
  bubbleIconRight: 'assets/steam-mind/contact-us/call-01-01 1.svg',
};


  // ✅ Contact info (dynamic)
  contactItems: ContactItem[] = [
    {
      icon: 'assets/steam-mind/contact-us/location (1) 1.svg',
      label: '1st Floor IT Park near Missile Chowk, Mandian, Abbottabad, Pakistan',
    },
    { icon: 'assets/steam-mind/contact-us/whatsapp 1.svg', label: '+92 319 0412670' },
    { icon: 'assets/steam-mind/contact-us/email 1.svg', label: 'info@steamminds.org' },
  ];

  // ✅ Bottom section (dynamic)
  section = {
    leftIllustration: 'assets/steam-mind/contact-us/Get in touch 1.svg', // ✅ replace with your illustration
    title: 'Contact Us',
    btnText: 'Submit',
  };

  // ✅ Form model (dynamic)
  form = {
    email: '',
    subject: '',
    message: '',
  };

  submit() {
    // integrate API here
    console.log('Contact form:', this.form);
  }
}
