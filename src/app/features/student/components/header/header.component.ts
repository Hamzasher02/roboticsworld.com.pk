import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NotificationsComponent } from '../notifications/notifications.component';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../../core/services/student/cart/cart.service';
import { Observable } from 'rxjs';
import { OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../../core/services/steam-mind/login.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, NotificationsComponent, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  showNotifications = false;
  cartCount$: Observable<number>;
  profilePicture = 'assets/student/header/userAvatar.svg';
  private sub = new Subscription();

  constructor(
    private cartService: CartService,
    private authService: AuthService
  ) {
    this.cartCount$ = this.cartService.cartItemCount$;
  }

  ngOnInit(): void {
    // Refresh cart state on load
    this.cartService.getMyCart().subscribe();

    this.sub.add(
      this.authService.user$.subscribe(user => {
        if (user?.profilePicture) {
          this.profilePicture = typeof user.profilePicture === 'string'
            ? user.profilePicture
            : user.profilePicture.secureUrl;
        } else {
          this.profilePicture = 'assets/student/header/userAvatar.svg';
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  toggleNotification(e: MouseEvent) {
    e.preventDefault();
    this.showNotifications = !this.showNotifications;
  }

  closeNotifications() {
    this.showNotifications = false;
  }

}

