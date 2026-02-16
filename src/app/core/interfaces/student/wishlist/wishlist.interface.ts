// wishlist interfaces
export interface WishlistItem {
    id: string;
    productId: string;
    title: string;
    imageUrl: string;
    addedAt: string;
}

export interface WishlistResponse {
    items: WishlistItem[];
}

export interface AddToWishlistRequest {
    productId: string;
}

export interface AddToWishlistResponse {
    wishlistItem: WishlistItem;
}

export interface RemoveFromWishlistResponse {
    removedId: string;
}

export interface MoveToCartRequest {
    id: string;
    quantity?: number;
}

export interface MoveToCartResponse {
    cart: import('../cart/cart.interface').Cart;
    removedWishlistId: string | null;
}
