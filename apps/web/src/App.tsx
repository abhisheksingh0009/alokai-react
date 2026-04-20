import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import Footer from "./components/layout/Footer";
import { WishlistProvider } from "./context/WishlistContext";
import Wishlist from "./components/Wishlist/Wishlist";
import Checkout from "./pages/Checkout";
import PayPalMock from "./pages/PayPalMock";
import CardPaymentMock from "./pages/CardPaymentMock";
import OrderSuccess from "./pages/OrderSuccess";
import GooglePayPage from "./pages/GooglePayPage";

export default function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <ToastProvider>
            <BrowserRouter>
              <Header />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<ProductList />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/login" element={<LoginForm />} />
                <Route path="/signup" element={<SignupForm />} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/paypal-mock" element={<PayPalMock />} />
                <Route path="/card-payment" element={<CardPaymentMock />} />
                <Route path="/order-success" element={<OrderSuccess />} />
                <Route path="/google-pay" element={<GooglePayPage />} />
              </Routes>
              <Footer />
            </BrowserRouter>
          </ToastProvider>
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}