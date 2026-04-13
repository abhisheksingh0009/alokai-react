import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/layout/Header";
import Home from "./pages/Home";
import ProductList from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./components/cart/Cart";
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./context/ToastContext";
import Footer from "./components/layout/Footer";

export default function App() {
  return (
    <CartProvider>
      <ToastProvider>
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
          </Routes>
          <Footer/>
        </BrowserRouter>
      </ToastProvider>
    </CartProvider>
  );
}