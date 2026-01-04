import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { WishlistProvider } from './context/WishlistContext';
import Wishlist from './pages/Wishlist';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ConfirmProvider } from './context/ConfirmContext';
import Home from './pages/Home';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import OrderList from './pages/OrderList';
import OrderDetail from './pages/OrderDetail';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import About from './pages/About';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProductListScreen from './pages/admin/ProductListScreen';
import ProductEditScreen from './pages/admin/ProductEditScreen';
import OrderListScreen from './pages/admin/OrderListScreen';
import UserListScreen from './pages/admin/UserListScreen';
import AdminCreateScreen from './pages/admin/AdminCreateScreen';
import CategoryListScreen from './pages/admin/CategoryListScreen';
import CategoryEditScreen from './pages/admin/CategoryEditScreen';
import ComplaintListScreen from './pages/admin/ComplaintListScreen';
import ComplaintDetailScreen from './pages/admin/ComplaintDetailScreen';
import CouponListScreen from './pages/admin/CouponListScreen';
import ChatBot from './components/ChatBot';
import MobileBottomNav from './components/MobileBottomNav';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function ConditionalChatBot() {
  const location = useLocation();
  // Hide ChatBot on admin pages
  if (location.pathname.startsWith('/admin')) {
    return null;
  }
  return <ChatBot />;
}

function ConditionalMobileNav() {
  const location = useLocation();
  // Hide on admin pages
  if (location.pathname.startsWith('/admin')) {
    return null;
  }
  return <MobileBottomNav />;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <ConfirmProvider>
            <CartProvider>
              <WishlistProvider>
                <Router>
                  <ScrollToTop />
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    {/* Protected Routes */}
                    <Route element={<ProtectedRoute />}>
                      <Route path="/products" element={<ProductList />} />
                      <Route path="/category/:category" element={<ProductList />} />
                      <Route path="/product/:id" element={<ProductDetail />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/wishlist" element={<Wishlist />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/orders" element={<OrderList />} />
                      <Route path="/order/:id" element={<OrderDetail />} />
                      <Route path="/profile" element={<Profile />} />
                    </Route>
                    {/* Admin Routes */}
                    <Route element={<ProtectedRoute adminOnly={true} />}>
                      <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<AdminDashboard />} />
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="products" element={<ProductListScreen />} />
                        <Route path="products/create" element={<ProductEditScreen />} />
                        <Route path="products/:id/edit" element={<ProductEditScreen />} />
                        <Route path="orders" element={<OrderListScreen />} />
                        <Route path="users" element={<UserListScreen />} />
                        <Route path="users/create" element={<AdminCreateScreen />} />
                        <Route path="categories" element={<CategoryListScreen />} />
                        <Route path="categories/create" element={<CategoryEditScreen />} />
                        <Route path="categories/:id/edit" element={<CategoryEditScreen />} />
                        <Route path="complaints" element={<ComplaintListScreen />} />
                        <Route path="complaints/:id" element={<ComplaintDetailScreen />} />
                        <Route path="coupons" element={<CouponListScreen />} />
                      </Route>
                    </Route>
                  </Routes>
                  <ConditionalChatBot />
                  <ConditionalMobileNav />
                </Router>
              </WishlistProvider>
            </CartProvider>
          </ConfirmProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
