import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CartService } from '../../../../core/services/student/cart/cart.service';
import { EnrollmentService } from '../../../../core/services/student/enrollment/enrollment.service';
import { WishlistService } from '../../../../core/services/student/wishlist/wishlist.service';
import { StudentEnrollmentStateService, EnrollmentState } from '../../../../core/services/student/enrollment/student-enrollment-state.service';
import { Cart, CartItem } from '../../../../core/interfaces/student/cart/cart.interface';
import { WishlistItem } from '../../../../core/interfaces/student/wishlist/wishlist.interface';

@Component({
  selector: 'app-check-out',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './check-out.component.html',
  styleUrl: './check-out.component.css'
})
export class CheckOutComponent implements OnInit, OnDestroy {
  cart: Cart | null = null;
  cartItems: CartItem[] = [];

  // Track wishlist items for cleanup
  wishlistItems: WishlistItem[] = [];

  enrollmentState: EnrollmentState | null = null;
  stateCourseData: any = null;

  selectedFile: File | null = null;
  filePreview: string | null = null;

  paymentNotes = '';

  loading = false;
  submitting = false;
  error = '';
  successMessage = '';

  private subscriptions: Subscription[] = [];

  constructor(
    private cartService: CartService,
    private enrollmentService: EnrollmentService,
    private wishlistService: WishlistService,
    private stateService: StudentEnrollmentStateService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const state = this.stateService.getState();
    if (state.courseData) {
      this.enrollmentState = state;
      this.stateCourseData = state.courseData;
      console.log('CheckOut: Enrolling in single course:', state.courseData.course.courseTitle);

      this.checkAlreadyEnrolled(state.courseData.course._id);
    }

    this.loadCart();
    this.loadWishlist();
  }

  private checkAlreadyEnrolled(courseId: string) {
    this.enrollmentService.checkEnrollmentStatus(courseId).subscribe({
      next: (res) => {
        if (res.isEnrolled || res.enrollment) {
          this.error = 'You are already enrolled or have a pending request for this course.';
        }
      },
      error: (err) => {
        console.error('Failed to check enrollment status in checkout:', err);
      }
    });
  }

  loadCart() {
    const cartSub = this.cartService.cart$.subscribe(cart => {
      this.cart = cart;
      this.cartItems = cart?.items || [];
    });
    this.subscriptions.push(cartSub);

    this.loading = true;
    this.cartService.getMyCart().subscribe({
      next: () => {
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load cart:', err);
        this.error = 'Failed to load cart';
        this.loading = false;
      }
    });
  }

  loadWishlist() {
    const wishlistSub = this.wishlistService.wishlist$.subscribe(items => {
      this.wishlistItems = items;
    });
    this.subscriptions.push(wishlistSub);

    this.wishlistService.getMyWishlist().subscribe({
      error: (err) => console.error('Failed to load wishlist:', err)
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        this.filePreview = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  removeFile(): void {
    this.selectedFile = null;
    this.filePreview = null;
  }

  async submitEnrollments(): Promise<void> {
    if (!this.selectedFile) {
      this.error = 'Please upload a payment screenshot';
      return;
    }

    this.submitting = true;
    this.error = '';
    this.successMessage = '';

    try {
      if (this.enrollmentState?.courseData) {
        // Handle Single Course Enrollment
        const { courseData, enrollmentType, selectedTimeSlot } = this.enrollmentState;
        const courseId = courseData.course._id;

        const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;

        const status = await this.enrollmentService.checkEnrollmentStatus(courseId).toPromise();

        if (status?.isEnrolled || status?.enrollment) {
          this.error = 'You are already enrolled or have a pending request for this course.';
          this.submitting = false;
          return;
        }

        await this.enrollmentService.createEnrollment(
          courseId,
          this.selectedFile,
          {
            enrollmentType: enrollmentType || 'Recorded Lectures',
            preferredClassTime: selectedTimeSlot || undefined,
            invoiceNumber
          }
        ).toPromise();

        // Cleanup: Remove from Cart if exists
        const cartItem = this.cartItems.find(i => i.course._id === courseId);
        if (cartItem) {
          try {
            await this.cartService.removeItem(cartItem._id).toPromise();
          } catch (e) {
            console.error('Failed to cleanup cart item:', e);
          }
        }

        // Cleanup: Remove from Wishlist if exists
        const wishlistItem = this.wishlistItems.find(i => i.productId === courseId);
        if (wishlistItem) {
          try {
            await this.wishlistService.removeFromWishlist(wishlistItem.id).toPromise();
          } catch (e) {
            console.error('Failed to cleanup wishlist item:', e);
          }
        }

        this.stateService.clearState();

      } else {
        // Handle Cart Enrollment
        if (this.cartItems.length === 0) {
          this.error = 'Your cart is empty';
          this.submitting = false;
          return;
        }

        const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;

        const enrollmentPromises = this.cartItems.map(item => {
          return this.enrollmentService.createEnrollment(
            item.course._id,
            this.selectedFile!,
            {
              enrollmentType: item.purchaseType || 'Recorded Lectures',
              invoiceNumber
            }
          ).toPromise();
        });

        await Promise.all(enrollmentPromises);

        // Cleanup: Remove all items from cart
        for (const item of this.cartItems) {
          try {
            await this.cartService.removeItem(item._id).toPromise();
          } catch (e) {
            console.error(`Failed to remove cart item ${item._id}`, e);
          }
        }

        // Cleanup: Remove enrolled items from Wishlist
        for (const item of this.cartItems) {
          const courseId = item.course._id;
          const wishlistItem = this.wishlistItems.find(w => w.productId === courseId);
          if (wishlistItem) {
            try {
              await this.wishlistService.removeFromWishlist(wishlistItem.id).toPromise();
            } catch (e) {
              console.error(`Failed to remove wishlist item for ${courseId}`, e);
            }
          }
        }
      }

      this.successMessage = 'Enrollment request submitted successfully! Awaiting admin approval.';

      setTimeout(() => {
        this.router.navigate(['/student/courses']);
      }, 2000);

    } catch (err: any) {
      console.error('Failed to create enrollment:', err);
      console.error('Raw API Error:', err);
      this.error = err.message || 'Failed to submit enrollment. Please try again.';
    } finally {
      this.submitting = false;
    }
  }

  get totalAmount(): number {
    if (this.enrollmentState?.courseData?.course) {
      const c = this.enrollmentState.courseData.course;
      const base = Number(c.price || c.coursePrice) || 0;

      if (c.discount) {
        return base * (1 - Number(c.discount) / 100);
      }

      return Number(c.discountPrice || c.coursePrice) || 0;
    }
    return this.cart?.totalAmount || 0;
  }

  get courseBasePrice(): number {
    if (this.enrollmentState?.courseData?.course) {
      const c = this.enrollmentState.courseData.course;
      return Number(c.price || c.coursePrice) || 0;
    }
    if (this.cartItems.length > 0) {
      return this.cartItems.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);
    }
    return 0;
  }

  get courseDiscount(): number {
    return Math.max(0, this.courseBasePrice - this.totalAmount);
  }

  get discountPercentage(): number {
    if (this.enrollmentState?.courseData?.course?.discount) {
      return Number(this.enrollmentState.courseData.course.discount);
    }
    if (this.courseBasePrice === 0) return 0;
    return Math.round((this.courseDiscount / this.courseBasePrice) * 100);
  }


  get displayCourseTitle(): string {
    return this.enrollmentState?.courseData?.course?.courseTitle || 'Cart Checkout';
  }

  get displayCoursePrice(): number {
    return this.totalAmount;
  }


  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}

