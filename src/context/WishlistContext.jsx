import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
    const { user } = useAuth();
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            fetchWishlist();
        } else {
            setWishlist([]);
        }
    }, [user]);

    const fetchWishlist = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/users/wishlist');
            setWishlist(data);
        } catch (error) {
            console.error("Failed to fetch wishlist", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleWishlist = async (productId) => {
        if (!user) {
            alert("Please login to manage wishlist");
            return;
        }

        try {
            // Optimistic update
            const isListed = wishlist.some(item => item._id === productId);
            if (isListed) {
                setWishlist(wishlist.filter(item => item._id !== productId));
            } else {
                // We can't immediately add the full product object effectively if we don't have it passed here,
                // but usually the backend returns the updated list or we refetch.
                // For smoother UI, we might just rely on refetch or pass the product object.
                // Let's rely on refetch for simplicity or backend response.
            }

            const { data } = await api.post(`/users/wishlist/${productId}`);
            // Backend returns { message, wishlist: [ids] } not populated objects usually?
            // Actually my controller returns { message, wishlist: [ids] }.
            // Wait, getWishlist returns POPULATED.
            // toggleWishlist returns UNPOPULATED IDs.
            // So we should probably refetch to get the full objects again, slightly slower but consistent.

            fetchWishlist();
        } catch (error) {
            console.error("Failed to toggle wishlist", error);
            // Revert on error if needed
        }
    };

    const isInWishlist = (productId) => {
        return wishlist.some(item => item._id === productId);
    };

    return (
        <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist, loading }}>
            {children}
        </WishlistContext.Provider>
    );
};
