import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { WishlistProvider } from './context/WishlistContext';
import Wishlist from './pages/Wishlist';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
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
import ProtectedRoute from './components/ProtectedRoute';
import About from './pages/About';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProductListScreen from './pages/admin/ProductListScreen';
import ProductEditScreen from './pages/admin/ProductEditScreen';
import OrderListScreen from './pages/admin/OrderListScreen';
import UserListScreen from './pages/admin/UserListScreen';
import CategoryListScreen from './pages/admin/CategoryListScreen';
import CategoryEditScreen from './pages/admin/CategoryEditScreen';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
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
                      <Route path="categories" element={<CategoryListScreen />} />
                      <Route path="categories/create" element={<CategoryEditScreen />} />
                      <Route path="categories/:id/edit" element={<CategoryEditScreen />} />
                    </Route>
                  </Route>
                </Routes>
              </Router>
            </WishlistProvider>
          </CartProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
