import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { ApiClientService } from '../../../http/api-client.service';
import { ApiResponse } from '../../../http/api.types';
import { AddToCartRequest, Cart, CartItem, UpdateCartQuantityRequest } from '../../../interfaces/student/cart/cart.interface';

/**
 * Service for student cart operations.
 * Maintains local cart state for reactive UI updates.
 */
@Injectable({ providedIn: 'root' })
export class CartService {
    private readonly BASE_PATH = '/cart';

    // Local cart state for reactive updates
    private readonly _cart$ = new BehaviorSubject<Cart | null>(null);
    readonly cart$ = this._cart$.asObservable();

    private readonly _cartItemCount$ = new BehaviorSubject<number>(0);
    readonly cartItemCount$ = this._cartItemCount$.asObservable();

    constructor(private api: ApiClientService) { }

    /**
     * Add a product to cart.
     * POST /cart/add
     */
    addToCart(courseId: string, purchaseType: 'Live Classes' | 'Recorded Lectures' = 'Live Classes', quantity: number = 1): Observable<Cart> {
        const payload: AddToCartRequest = { courseId, purchaseType, quantity };
        return this.api.post<Cart>(`${this.BASE_PATH}/add`, payload).pipe(
            tap((cart) => this.updateCartState(cart))
        );
    }

    /**
     * Get current user's cart.
     * GET /cart/my
     */
    getMyCart(): Observable<Cart> {
        return this.api.get<Cart>(`${this.BASE_PATH}/my`).pipe(
            tap((cart) => this.updateCartState(cart))
        );
    }

    /**
     * Update quantity of a cart item.
     * PATCH /cart/updateCartQuantity/:itemId
     */
    updateQuantity(itemId: string, quantity: number): Observable<Cart> {
        const payload: UpdateCartQuantityRequest = { quantity };
        return this.api.patch<Cart>(
            `${this.BASE_PATH}/updateCartQuantity/${itemId}`,
            payload
        ).pipe(
            tap((cart) => this.updateCartState(cart))
        );
    }

    /**
     * Remove an item from cart.
     * DELETE /cart/deleteCartItem/:itemId
     */
    removeItem(itemId: string): Observable<Cart> {
        return this.api.delete<Cart>(`${this.BASE_PATH}/remove/${itemId}`).pipe(
            tap((cart) => this.updateCartState(cart))
        );
    }

    /**
     * Clear all items from cart.
     * DELETE /cart/clearCart
     */
    clearCart(): Observable<Cart> {
        return this.api.delete<Cart>(`${this.BASE_PATH}/clearCart`).pipe(
            tap((cart) => this.updateCartState(cart))
        );
    }

    /**
     * Get current cart items from local state.
     */
    getCartItems(): CartItem[] {
        return this._cart$.value?.items || [];
    }

    /**
     * Check if a course is already in the cart.
     */
    isInCart(courseId: string): boolean {
        return this.getCartItems().some(item => item.course._id === courseId);
    }

    /**
     * Get current cart total from local state.
     */
    getCartTotal(): number {
        return this._cart$.value?.totalAmount || 0;
    }

    /**
     * Reset cart state (e.g., on logout).
     */
    resetCartState(): void {
        this._cart$.next(null);
        this._cartItemCount$.next(0);
    }

    // ─────────────────────────────────────────────────────────────
    // Private Helpers
    // ─────────────────────────────────────────────────────────────

    private updateCartState(cart: Cart): void {
        this._cart$.next(cart);
        this._cartItemCount$.next(cart?.totalItems || 0);
    }
}

