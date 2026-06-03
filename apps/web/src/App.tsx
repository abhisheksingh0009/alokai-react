import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Header from "./components/layout/Header";
import Home from "./pages/Home";
import ProductList from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./components/cart/Cart";
import AccountPage from "./pages/AccountPage";
import LoginForm from "./components/user-form/LoginForm";
import SignupForm from "./components/user-form/SignupForm";
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./context/ToastContext";
import { AuthProvider } from "./context/AuthContext";
import { UIProvider } from "./context/UIContext";
import Footer from "./components/layout/Footer";
import { WishlistProvider } from "./context/WishlistContext";
import Wishlist from "./components/Wishlist/Wishlist";
import CartDrawer from "./components/cart/CartDrawer";
import Checkout from "./pages/Checkout";
import PayPalMock from "./pages/PayPalMock";
import CardPaymentMock from "./pages/CardPaymentMock";
import OrderSuccess from "./pages/OrderSuccess";
import GooglePayPage from "./pages/GooglePayPage";
import OrderHistory from "./pages/OrderHistory";
import { AlokaiI18nProvider } from "./context/AlokaiI18nContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import { usePageTracking } from "./hooks/usePageTracking";

// Fires GA4 page_view on every route change. Must live inside the Router.
function PageTracker() {
  usePageTracking();
  return null;
}

export default function App() {
  return (
    <HelmetProvider>
    <AuthProvider>
      <WishlistProvider>
        <UIProvider>
          <CartProvider>
            <ToastProvider>
              <AlokaiI18nProvider>
                <BrowserRouter>
                  <PageTracker />
                  <div className="min-h-screen flex flex-col">
                    <Header />
                    <CartDrawer />
                    <main className="flex-1">
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/products" element={<ProductList />} />
                        <Route path="/product/:id" element={<ProductDetail />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/wishlist" element={<Wishlist />} />
                        <Route path="/login" element={<LoginForm />} />
                        <Route path="/signup" element={<SignupForm />} />
                        <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
                        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                        <Route path="/paypal-mock" element={<PayPalMock />} />
                        <Route path="/card-payment" element={<CardPaymentMock />} />
                        <Route path="/order-success" element={<OrderSuccess />} />
                        <Route path="/google-pay" element={<GooglePayPage />} />
                        <Route path="/orders" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
                      </Routes>
                    </main>
                    <Footer />
                  </div>
                </BrowserRouter>
              </AlokaiI18nProvider>
            </ToastProvider>
          </CartProvider>
        </UIProvider>
      </WishlistProvider>
    </AuthProvider>
    </HelmetProvider>
  );
}