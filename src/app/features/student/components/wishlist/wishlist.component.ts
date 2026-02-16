import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, Router } from "@angular/router";
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { CartService } from '../../../../core/services/student/cart/cart.service';
import { CoursesService } from '../../../../core/services/student/get-all-courses/get-all-courses.service';
import { StudentEnrollmentStateService } from '../../../../core/services/student/enrollment/student-enrollment-state.service';
import { CartItem } from '../../../../core/interfaces/student/cart/cart.interface';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.css'
})
export class WishlistComponent implements OnInit, OnDestroy {
  // Wishlist data (sourced from Cart)
  wishlistItems: any[] = [];

  // Loading states
  loading = false;
  updating = false;

  // Error state
  error = '';

  private subscriptions: Subscription[] = [];

  constructor(
    private cartService: CartService,
    private coursesService: CoursesService,
    private enrollmentStateService: StudentEnrollmentStateService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit(): void {
    // Initial load
    this.loadWishlist();
  }

  loadWishlist(): void {
    this.loading = true;
    this.error = '';

    const sub = this.cartService.getMyCart().subscribe({
      next: (cart) => {
        // Map Cart items to match what the template expects
        this.wishlistItems = cart.items.map((item: any) => ({
          id: item._id,
          productId: item.course._id,
          title: item.courseTitle,
          imageUrl: item.courseThumbnail?.secureUrl || item.course?.courseThumbnail?.secureUrl,
          addedAt: item.addedAt,
          price: item.price
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load cart:', err);
        this.error = 'Failed to load your cart items';
        this.loading = false;
      }
    });
    this.subscriptions.push(sub);
  }

  moveToCart(item: any): void {
    this.updating = true;
    this.coursesService.getSingleCourseStudentSide(item.productId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.enrollmentStateService.setCourse(res.data);
          this.router.navigate(['/student/buy-course']);
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load course details. Please try again.' });
        }
        this.updating = false;
      },
      error: (err) => {
        console.error('Failed to fetch course details:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'An error occurred. Please try again.' });
        this.updating = false;
      }
    });
  }

  removeItem(item: any): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to remove this item?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.updating = true;
        this.cartService.removeItem(item.id).subscribe({
          next: () => {
            // Update local list after removal
            this.wishlistItems = this.wishlistItems.filter(i => i.id !== item.id);
            this.updating = false;
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Item removed successfully' });
          },
          error: (err) => {
            console.error('Failed to remove item:', err);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to remove item. Please try again.' });
            this.updating = false;
          }
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}

