import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { useNavigate } from 'react-router-dom';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const { user } = useAuth();
    const { showToast } = useToast();
    // Cannot use useNavigate here as CartProvider is inside Router in App.jsx?
    // Wait, in App.jsx, Router is INSIDE CartProvider in the previous structure.
    // AuthProvider > ToastProvider > CartProvider > WishlistProvider > Router
    // So useNavigate IS NOT available here.
    // I must refrain from using useNavigate, or move Router up.
    // I will use window.location.href for redirect if needed, or rely on the component to handle redirect.
    // BUT the request says "If user is not logged in: ... Redirect to /login".
    // I'll throw an error or return false, and let component handle it?
    // Or I can return a promise that rejects?

    // Better: Helper function checks auth.

    useEffect(() => {
        if (user) {
            fetchCart();
        } else {
            setCart([]);
        }
    }, [user]);

    const fetchCart = async () => {
        try {
            const { data } = await api.get('/cart');
            setCart(data);
        } catch (error) {
            console.error("Failed to fetch cart", error);
        }
    };

    const addToCart = async (product, quantity = 1) => {
        if (!user) {
            showToast("Please login to add items to cart", "error");
            // Since we are outside Router, we can't nicely redirect without full reload or creating a custom history object.
            // But since ProductCard has the button, checking auth THERE is cleaner for redirect logic?
            // "If user is not logged in: Do NOT call API, Redirect to /login".
            // I'll return false here and let the component redirect.
            return false;
        }

        try {
            const { data } = await api.post('/cart/add', {
                productId: product._id || product.id,
                quantity,
                name: product.name,
                image: product.image,
                price: product.price,
                countInStock: product.countInStock
            });
            setCart(data.items);
            showToast("Item added to cart successfully", "success");
            return true;
        } catch (error) {
            console.error(error);
            showToast(error.response?.data?.message || "Failed to add item to cart", "error");
            return false;
        }
    };

    const removeFromCart = async (productId) => {
        try {
            // Optimistic update
            setCart(prev => prev.filter(item => (item.product?._id || item.product || item._id) !== productId));

            await api.delete(`/cart/remove/${productId}`);
            // Optionally refetch or use returned cart
            // const { data } = await api.delete...
            // setCart(data.items);
            showToast("Item removed from cart", "success");
        } catch (error) {
            console.error(error);
            showToast("Failed to remove item", "error");
            // Revert on failure if needed, or just fetchCart()
            fetchCart();
        }
    };

    const updateQuantity = async (productId, newQuantity) => {
        if (newQuantity < 1) return;

        try {
            // Optimistic update to make UI snappy
            setCart(prevCart =>
                prevCart.map(item =>
                    (item.product?._id || item.product || item._id) === productId
                        ? { ...item, quantity: newQuantity }
                        : item
                )
            );

            await api.put('/cart/update', { productId, quantity: newQuantity });
        } catch (error) {
            console.error(error);
            showToast("Failed to update quantity", "error");
            fetchCart(); // Revert to server state
        }
    };

    const clearCart = () => setCart([]);

    const getCartTotal = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const getCartCount = () => {
        return cart.reduce((count, item) => count + item.quantity, 0);
    };

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            getCartTotal,
            getCartCount
        }}>
            {children}
        </CartContext.Provider>
    );
};
