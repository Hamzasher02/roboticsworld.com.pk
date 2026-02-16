import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css',
})
export class AuthComponent {
  // default screen: Login
  mode: 'login' | 'signup' = 'login';

  // demo models (aap apni API ke hisaab se change kar lena)
  loginForm = {
    email: '',
    password: '',
  };

  signupForm = {
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agree: false,
  };

  showLogin() {
    this.mode = 'login';
  }

  showSignup() {
    this.mode = 'signup';
  }

  onLogin() {
    // TODO: call login API
    console.log('LOGIN', this.loginForm);
  }

  onSignupNext() {
    // TODO: call signup API / next step
    console.log('SIGNUP', this.signupForm);
  }
}
