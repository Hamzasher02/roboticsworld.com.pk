import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, Subscription } from 'rxjs';

import { ComposeMessageComponent } from '../compose-message/compose-message.component';
import { AuthService } from '../../../../core/services/steam-mind/login.service';
import { LoginUser } from '../../../../core/interfaces/steam-mind/login';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-student-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, ComposeMessageComponent], // ✅ add this
  templateUrl: './student-header.component.html',
  styleUrl: './student-header.component.css',
})
export class StudentHeaderComponent implements OnInit, OnDestroy {
  user: LoginUser | null = null;
  email = '';
  name = '';
  profilePicture = '';
  isComposeOpen = false;

  actionButton: 'demo' | 'ask' | 'compose' | 'logout' | 'none' = 'demo';

  private sub = new Subscription();

  constructor(
    private router: Router,
    private authService: AuthService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit(): void {
    this.updateActionButton(this.router.url);

    this.sub.add(
      this.router.events
        .pipe(filter((e) => e instanceof NavigationEnd))
        .subscribe((e) => {
          this.updateActionButton((e as NavigationEnd).urlAfterRedirects);

          // ✅ optional safety: close modal when leaving messages
          const path = ((e as NavigationEnd).urlAfterRedirects || '').toLowerCase();
          if (!path.includes('/student/messages')) this.isComposeOpen = false;
        })
    );

    // ✅ Get Dynamic User Data
    this.sub.add(
      this.authService.user$.subscribe(user => {
        this.user = user;
        if (user) {
          this.email = user.email || '';
          this.name = (user.firstName && user.lastName)
            ? `${user.firstName} ${user.lastName}`
            : (user.firstName || user.lastName || 'Student');

          if (user.profilePicture) {
            this.profilePicture = typeof user.profilePicture === 'string'
              ? user.profilePicture
              : user.profilePicture.secureUrl;
          } else {
            this.profilePicture = '';
          }
        } else {
          this.email = '';
          this.name = '';
          this.profilePicture = '';
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private updateActionButton(url: string): void {
    const path = (url || '').toLowerCase();

    if (path.includes('/student/wishlist')) {
      this.actionButton = 'none';
      return;
    }

    if (path.includes('/student/quiz') || path.includes('/student/settings')) {
      this.actionButton = 'logout';
      return;
    }

    if (path.includes('/student/messages')) {
      this.actionButton = 'compose';
      return;
    }

    if (path.includes('/student/forum')) {
      this.actionButton = 'ask';
      return;
    }

    this.actionButton = 'demo';
  }

  logout(): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to logout?',
      header: 'Logout Confirmation',
      icon: 'pi pi-power-off',
      accept: () => {
        this.authService.logout().subscribe({
          next: () => {
            this.router.navigate(['/auth/login']);
          },
          error: () => {
            this.router.navigate(['/auth/login']);
          }
        });
      }
    });
  }
}
