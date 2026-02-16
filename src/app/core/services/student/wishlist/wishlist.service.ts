import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { ApiClientService } from '../../../http/api-client.service';
import {
    WishlistItem,
    AddToWishlistRequest,
    AddToWishlistResponse,
    RemoveFromWishlistResponse,
    MoveToCartRequest,
    MoveToCartResponse,
    WishlistResponse
} from '../../../interfaces/student/wishlist/wishlist.interface';
import { CartService } from '../cart/cart.service';

@Injectable({ providedIn: 'root' })
export class WishlistService {
    private readonly BASE_PATH = '/wishlist';

    private readonly _wishlist$ = new BehaviorSubject<WishlistItem[]>([]);
    readonly wishlist$ = this._wishlist$.asObservable();

    constructor(
        private api: ApiClientService,
        private cartService: CartService // Inject CartService to update cart when moving items
    ) { }

    /**
     * Add product to wishlist.
     * POST /wishlist/addToWishlist
     */
    addToWishlist(productId: string): Observable<AddToWishlistResponse> {
        const payload: AddToWishlistRequest = { productId };
        return this.api.post<AddToWishlistResponse>(`${this.BASE_PATH}/addToWishlist`, payload).pipe(
            tap(response => {
                const current = this._wishlist$.value;
                // Avoid duplicates in local state
                if (!current.some(item => item.productId === productId)) {
                    this._wishlist$.next([...current, response.wishlistItem]);
                }
            })
        );
    }

    /**
     * Check if a product is in wishlist locally.
     */
    isInWishlist(productId: string): boolean {
        return this._wishlist$.value.some(item =>
            item.productId === productId
        );
    }

    /**
     * Get user's wishlist.
     * GET /wishlist/getWishlist
     */
    getMyWishlist(): Observable<WishlistResponse> {
        return this.api.get<WishlistResponse>(`${this.BASE_PATH}/getWishlist`).pipe(
            tap(response => {
                this._wishlist$.next(response.items);
            })
        );
    }

    /**
     * Remove item from wishlist.
     * DELETE /wishlist/deleteWishlist/:id
     */
    removeFromWishlist(id: string): Observable<RemoveFromWishlistResponse> {
        return this.api.delete<RemoveFromWishlistResponse>(`${this.BASE_PATH}/deleteWishlist/${id}`).pipe(
            tap(response => {
                const current = this._wishlist$.value;
                this._wishlist$.next(current.filter(item => item.id !== response.removedId));
            })
        );
    }

    /**
     * Move item from wishlist to cart.
     * POST /wishlist/moveToCart
     */
    moveToCart(id: string, quantity: number = 1): Observable<MoveToCartResponse> {
        const payload: MoveToCartRequest = { id, quantity };
        return this.api.post<MoveToCartResponse>(`${this.BASE_PATH}/moveToCart`, payload).pipe(
            tap(response => {
                // Update cart state
                // We need to access the private method or public subject setter of cartService if possible, 
                // but CartService exposes a public method to refresh cart or we can just emit the new cart.
                // Since CartService manages its state internally via addToCart/etc, we can't directly set it 
                // unless we add a method to CartService or just rely on CartService fetching it again?
                // Actually, the response contains the 'cart' object. 
                // We should expose a method in CartService to update state from external source.
                // For now, let's cast to any or add a public 'setInputCart' method to CartService.
                // Or a cleaner way: The CartService has updateCartState which is private.
                // Ideally, we should update the cart service with the new cart data.
                // I'll add a public method `updateState` to `CartService` in a separate edit, or just cast for now.
                // Actually, simpler: just call getMyCart() to refresh, or if CartService exposes a way to set it.
                // But wait, the previous `CartService` has `updateCartState` as private. 
                // I should have made it public or accessible. 
                // I will assume I can fix CartService to allow state update or I will just refresh cart.
                // Refetching cart is safer to ensure sync.
                this.cartService.getMyCart().subscribe();

                // Update wishlist state locally
                if (response.removedWishlistId) {
                    const current = this._wishlist$.value;
                    this._wishlist$.next(current.filter(item => item.id !== response.removedWishlistId));
                }
            })
        );
    }
}

