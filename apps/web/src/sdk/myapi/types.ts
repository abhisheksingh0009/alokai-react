// Domain types for the `myapi` integration.
// These were previously declared in middleware/api/client.ts and are re-exported
// from there for backward compatibility.

export type Product = {
  id: number;
  title: string;
  price: number;
  images: string[];
  thumbnail: string;
  description: string;
  rating?: number;
  stock?: number;
  reviewCount?: number;
  avgReviewRating?: number | null;
  category?: string;
  discountPercentage?: number;
  brand?: string;
  warrantyInformation?: string;
  shippingInformation?: string;
  returnPolicy?: string;
  tags?: string[];
};

export type Comment = {
  id: number;
  body: string;
  postId: number;
  likes: number;
  user: { id: number; username: string; fullName: string };
};

// Prisma Decimal/text columns come back as strings over JSON.
export type DBProduct = {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  price: string | null;
  discountPercentage: string | null;
  rating: string | null;
  stock: number | null;
  brand: string | null;
  sku: string | null;
  weight: string | null;
  warrantyInformation: string | null;
  shippingInformation: string | null;
  availabilityStatus: string | null;
  returnPolicy: string | null;
  minimumOrderQuantity: number | null;
  thumbnail: string | null;
  _count?: { reviews: number };
  avgReviewRating?: number | null;
};

export type CartItem = Product & { quantity: number };

export type Review = {
  id: number;
  comment: string;
  likes: number;
  providerName: string;
  productId: number;
  userEmail: string;
  rating: number;
  createdAt: string;
};

export type Address = {
  id: number;
  userEmail: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  label: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AddressPayload = {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  label?: string;
  isDefault?: boolean;
};
