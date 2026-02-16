import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { RouterLink, RouterModule,  } from '@angular/router';

@Component({
  selector: 'app-website-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterModule],
  templateUrl: './website-header.component.html',
  styleUrl: './website-header.component.css',
})
export class WebsiteHeaderComponent {
  isCampsOpen = false;
  isMobileMenuOpen = false;

  toggleCamps(): void {
    this.isCampsOpen = !this.isCampsOpen;
  }

  toggleMobileMenu(event?: Event): void {
    event?.stopPropagation();
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    this.isCampsOpen = false;
  }

  closeAllMenus(): void {
    this.isCampsOpen = false;
    this.isMobileMenuOpen = false;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeAllMenus();
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    this.closeAllMenus();
  }
}
