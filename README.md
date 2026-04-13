# Alokai Storefront POC

A proof-of-concept e-commerce storefront built with **Alokai** (Storefront UI), **React 19**, **TypeScript**, and **Vite**. The project demonstrates a complete shopping experience — product listing, filtering, product detail pages, cart management, and customer reviews — all powered by the [DummyJSON](https://dummyjson.com) API.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build tool | Vite |
| UI components | Storefront UI v4 (`@storefront-ui/react`) |
| Styling | Tailwind CSS v4 |
| Routing | React Router v7 |
| Async state | `react-use` (`useAsync`) |
| Data source | DummyJSON REST API |

---

## Features

- **Home page** — Hero carousel, promotional banners, featured categories
- **Product listing** — Paginated grid with category filters and search
- **Product detail page (PDP)**
  - Image gallery with thumbnail navigation
  - Sale price, discount badge, stock indicator
  - Add to Cart with toast feedback
  - Wishlist button
  - Trust badges (shipping, returns, warranty)
  - "You may also like" recommendations
  - Customer reviews section (deterministic per-product, sourced from DummyJSON comments)
- **Cart** — Line items, quantity controls, promo code input, order summary
- **Global state** — Cart context + Toast notification context

---

## Project Structure

```
src/
├── components/
│   ├── Carousel/        # Hero banners and overlay banners
│   ├── ProductCard/     # Reusable product card
│   ├── ProductList/     # Grid, filters, pagination, skeleton
│   ├── cart/            # Cart drawer, rows, summary, promo code
│   ├── common/          # AddToCartButton, Breadcrumb, Review, ReviewsSection
│   └── layout/          # Header, Footer
├── context/             # CartContext, ToastContext
├── hooks/               # useProducts, useProductFilters
├── middleware/api/      # Typed API client + endpoint config (DummyJSON)
└── pages/               # Home, ProductList, ProductDetail
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Install & run

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for production

```bash
npm run build
npm run preview
```

---

## API

All data is fetched from [DummyJSON](https://dummyjson.com). The API client lives in `src/middleware/api/` and exposes:

| Function | Endpoint |
|---|---|
| `fetchProducts` | `GET /products` |
| `fetchProduct` | `GET /products/:id` |
| `searchProducts` | `GET /products/search` |
| `fetchProductsByCategory` | `GET /products/category/:category` |
| `fetchCategories` | `GET /products/categories` |
| `fetchComments` | `GET /comments` |
