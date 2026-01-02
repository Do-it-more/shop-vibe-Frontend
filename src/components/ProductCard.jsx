import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Star, Heart } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
    const id = product.id || product._id;
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { user } = useAuth();
    const { addToCart } = useCart();
    const isWishlisted = isInWishlist(id);
    const [adding, setAdding] = React.useState(false);
    const navigate = useNavigate();

    const handleAddToCart = async (e) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent link click

        if (!user) {
            navigate('/login');
            return;
        }

        setAdding(true);
        await addToCart(product, 1);
        setAdding(false);
    };

    const handleWishlistClick = (e) => {
        e.preventDefault();
        if (!user) {
            // alert("Please login to use wishlist"); 
            navigate('/login'); // Better UX per requirements
            return;
        }
        toggleWishlist(id);
    };

    const getImageUrl = (path) => {
        if (!path) return 'https://via.placeholder.com/300';
        if (path.startsWith('http')) return path;
        // Prepend backend URL for relative paths
        const baseUrl = 'http://localhost:5001';
        return `${baseUrl}${path}`;
    };

    return (
        <motion.div
            whileHover={{ y: -8 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)] transition-all duration-300 overflow-hidden border border-gray-100 dark:border-slate-700 group relative"
        >
            <Link to={`/product/${id}`} className="block relative aspect-[3/4] overflow-hidden bg-gray-50 dark:bg-slate-700">
                <img
                    src={getImageUrl(product.image)}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />

                {/* Wishlist Button */}
                <button
                    onClick={handleWishlistClick}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm hover:bg-white dark:hover:bg-slate-900 transition-colors z-10"
                >
                    <Heart className={`h-5 w-5 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-300 hover:text-red-500'}`} />
                </button>

                {product.discount && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                        {product.discount}% OFF
                    </span>
                )}
                {/* Quick add overlay */}
                <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/50 to-transparent">
                    <button
                        onClick={handleAddToCart}
                        disabled={adding}
                        className="w-full py-3 bg-white text-slate-900 font-semibold rounded-xl hover:bg-indigo-600 hover:text-white transition-colors shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait"
                    >
                        {adding ? (
                            <span className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></span>
                        ) : (
                            <>
                                <ShoppingCart className="h-4 w-4" />
                                Add to Cart
                            </>
                        )}
                    </button>
                </div>
            </Link>

            <div className="p-3 sm:p-5">
                <div className="flex items-center space-x-1 mb-2">
                    <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-current" />
                    <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">{product.rating}</span>
                    <span className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500">({product.numReviews || product.reviews})</span>
                </div>
                <Link to={`/product/${id}`}>
                    <h3 className="text-sm sm:text-lg font-bold text-slate-800 dark:text-slate-100 mb-1 truncate hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{product.name}</h3>
                </Link>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3 sm:mb-4 capitalize">{product.category}</p>

                <div className="flex items-end justify-between">
                    <div className="flex flex-col">
                        {product.oldPrice && <span className="text-xs sm:text-sm text-gray-400 line-through">₹{product.oldPrice}</span>}
                        <span className="text-base sm:text-xl font-bold text-slate-900 dark:text-white">₹{product.price}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;
