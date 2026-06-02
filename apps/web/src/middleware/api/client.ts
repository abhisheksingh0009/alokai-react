/**
 * Backward-compatible API surface.
 *
 * The real implementation now lives in the Alokai SDK module `sdk.myapi`
 * (see src/sdk/). This file re-exports the same function names and types so
 * existing components keep working without changes. New code should prefer:
 *
 *     import { sdk } from '../../sdk';
 *     await sdk.myapi.getProducts();
 */
import { sdk } from '../../sdk';

export type {
  Product,
  Comment,
  DBProduct,
  CartItem,
  Review,
  Address,
  AddressPayload,
} from '../../sdk/myapi/types';

// ── Products ──────────────────────────────────────────────────────────────
export const fetchComments              = sdk.myapi.fetchComments;
export const fetchProductsFromDB        = sdk.myapi.getProducts;
export const fetchProductFromDB         = sdk.myapi.getProduct;
export const fetchProductsByCategoryFromDB = sdk.myapi.getProductsByCategory;
export const searchProductsFromDB       = sdk.myapi.searchProducts;
export const fetchCategoriesFromDB      = sdk.myapi.getCategories;

// ── Cart ────────────────────────────────────────────────────────────────────
export const fetchCart                  = sdk.myapi.getCart;
export const upsertCartItem             = sdk.myapi.upsertCartItem;
export const patchCartItem              = sdk.myapi.patchCartItem;
export const removeCartItem             = sdk.myapi.removeCartItem;

// ── Reviews ──────────────────────────────────────────────────────────────────
export const fetchReviews               = sdk.myapi.getReviews;
export const submitReview               = sdk.myapi.submitReview;

// ── Stock notifications ──────────────────────────────────────────────────────
export const subscribeStockNotification = sdk.myapi.subscribeStockNotification;
export const checkStockSubscription     = sdk.myapi.checkStockSubscription;

// ── Wishlist ─────────────────────────────────────────────────────────────────
export const fetchWishlist              = sdk.myapi.getWishlist;
export const toggleWishlistItem         = sdk.myapi.toggleWishlistItem;
export const removeWishlistItem         = sdk.myapi.removeWishlistItem;

// ── Addresses ────────────────────────────────────────────────────────────────
export const fetchAddresses             = sdk.myapi.getAddresses;
export const saveAddress                = sdk.myapi.saveAddress;
export const updateAddress              = sdk.myapi.updateAddress;
export const setDefaultAddress          = sdk.myapi.setDefaultAddress;
export const deleteAddress              = sdk.myapi.deleteAddress;
