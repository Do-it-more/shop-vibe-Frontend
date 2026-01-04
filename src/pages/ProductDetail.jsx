import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { Star, ShoppingCart, ShoppingBag, Minus, Plus, Heart, Truck, ShieldCheck, ArrowLeft, ArrowRight, Loader } from 'lucide-react';

const ProductDetail = () => {
    const { id } = useParams();
    const { addToCart } = useCart();
    const { user } = useAuth();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { showToast } = useToast();
    const location = useLocation();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [relatedProducts, setRelatedProducts] = useState([]);

    const submitHandler = useCallback(async (e) => {
        e.preventDefault();
        try {
            await api.post(`/products/${id}/reviews`, { rating, comment });
            showToast('Review Submitted!', 'success');
            setComment('');
            setRating(0);
            // Reload product to show new review
            const { data } = await api.get(`/products/${id}`);
            setProduct(data);
        } catch (error) {
            showToast(error.response?.data?.message || 'Error submitting review', 'error');
        }
    }, [id, rating, comment, showToast]);

    const getImageUrl = useCallback((path) => {
        if (!path) return 'https://via.placeholder.com/300';
        if (path.startsWith('http')) return path;
        const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:5001').replace(/\/api\/?$/, '');
        return `${apiBase}${path}`;
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0); // Reset scroll to top on product change
        const fetchProduct = async () => {
            try {
                // Parallel fetch for product data and related items
                const [productRes, relatedRes] = await Promise.all([
                    api.get(`/products/${id}`),
                    api.get(`/products/${id}/related`)
                ]);

                setProduct(productRes.data);
                setRelatedProducts(relatedRes.data);
            } catch (error) {
                console.error("Failed to fetch product data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    // Use real product images array if available, otherwise fallback to main image
    const images = useMemo(() => {
        if (!product) return [];
        return (product.images && product.images.length > 0)
            ? product.images
            : [product.image];
    }, [product]);

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader className="animate-spin h-10 w-10 text-indigo-600" /></div>;
    if (!product) return <div className="min-h-screen flex items-center justify-center text-xl text-gray-500">Product not found</div>;

    return (
        <div className="min-h-screen flex flex-col bg-white dark:bg-slate-900 transition-colors duration-300">
            <Navbar />

            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                <Link to="/products" className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-8 transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Back to Products
                </Link>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
                    {/* Image Gallery */}
                    <div className="space-y-4">
                        <div className="aspect-square bg-gray-50 dark:bg-slate-800 rounded-3xl overflow-hidden border border-gray-100 dark:border-slate-700 relative group">
                            <img
                                src={getImageUrl(images[activeImage])}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            {product.discount && (
                                <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg">
                                    {product.discount}% OFF
                                </span>
                            )}
                        </div>
                        {images.length > 1 && (
                            <div className="grid grid-cols-4 gap-4">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(idx)}
                                        className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-indigo-600 ring-2 ring-indigo-100 dark:ring-indigo-900' : 'border-gray-100 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'}`}
                                    >
                                        <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div>
                        <div className="mb-2 text-indigo-600 dark:text-indigo-400 font-semibold text-sm uppercase tracking-wide">{product.category}</div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">{product.name}</h1>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`h-5 w-5 ${i < Math.floor(product.rating || 4.5) ? 'fill-current' : 'text-gray-200 dark:text-slate-600'}`} />
                                ))}
                            </div>
                            <span className="text-gray-500 dark:text-gray-400 text-sm">({product.numReviews || 0} verified reviews)</span>
                        </div>

                        <div className="flex items-end gap-3 mb-8">
                            <span className="text-4xl font-bold text-slate-900 dark:text-white">₹{product.price}</span>
                            {product.oldPrice && (
                                <span className="text-xl text-gray-400 dark:text-gray-500 line-through mb-1">₹{product.oldPrice}</span>
                            )}
                        </div>

                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-8 border-b border-gray-100 dark:border-slate-700 pb-8">
                            {product.description || "This premium product is crafted with attention to detail. Perfect for your daily needs and durable enough to last. Features state-of-the-art technology and modern design aesthetics."}
                        </p>

                        {/* Actions */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-6">
                                <div className="flex items-center border border-gray-200 dark:border-slate-600 rounded-full bg-gray-50 dark:bg-slate-800">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                    >
                                        <Minus className="h-4 w-4" />
                                    </button>
                                    <span className="w-10 text-center font-bold text-slate-900 dark:text-white">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <div className={`h-2 w-2 rounded-full ${product.countInStock > 5 ? 'bg-green-500' : product.countInStock > 0 ? 'bg-orange-500 animate-pulse' : 'bg-red-500'}`}></div>
                                        <span className={`text-sm font-semibold ${product.countInStock > 5 ? 'text-green-600 dark:text-green-400' : product.countInStock > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-red-500'}`}>
                                            {product.countInStock > 5 ? 'In Stock' : product.countInStock > 0 ? `Only ${product.countInStock} Left!` : 'Out of Stock'}
                                        </span>
                                    </div>
                                    {product.countInStock > 0 && product.countInStock <= 10 && (
                                        <p className="text-[10px] text-gray-400 font-medium italic">Hurry! Selling fast</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-4">
                                {user ? (
                                    user.role === 'admin' ? (
                                        <button
                                            disabled
                                            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-full font-bold text-lg bg-gray-100 dark:bg-slate-800 text-gray-400 cursor-not-allowed border border-gray-200 dark:border-slate-700"
                                        >
                                            <ShoppingBag className="h-5 w-5" />
                                            Admin View Only
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => addToCart(product, quantity)}
                                            disabled={product.countInStock === 0}
                                            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-xl active:scale-95 ${product.countInStock === 0 ? 'bg-gray-200 dark:bg-slate-700 text-gray-400 cursor-not-allowed' : 'bg-slate-900 dark:bg-indigo-600 text-white hover:bg-slate-800 dark:hover:bg-indigo-700'}`}
                                        >
                                            <ShoppingCart className="h-5 w-5" />
                                            {product.countInStock === 0 ? 'Out of Stock' : 'Add to Cart'}
                                        </button>
                                    )
                                ) : (
                                    <Link
                                        to="/login"
                                        state={{ from: location }}
                                        className="flex-1 bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-gray-400 py-4 rounded-full font-bold text-lg cursor-not-allowed flex items-center justify-center gap-2"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            navigate('/login', { state: { from: location } });
                                        }}
                                    >
                                        <ShoppingCart className="h-5 w-5" />
                                        Login to Add
                                    </Link>
                                )}
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (!user) {
                                            navigate('/login', { state: { from: location } });
                                            return;
                                        }
                                        toggleWishlist(product._id);
                                    }}
                                    className={`w-14 h-14 rounded-full border flex items-center justify-center transition-all ${isInWishlist(product._id)
                                        ? 'border-red-500 bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-900/20 dark:border-red-900'
                                        : 'border-gray-200 dark:border-slate-600 text-gray-500 dark:text-gray-400 hover:text-red-500 hover:border-red-200'
                                        }`}
                                >
                                    <Heart className={`h-6 w-6 ${isInWishlist(product._id) ? 'fill-current' : ''}`} />
                                </button>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-gray-100 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                                    <Truck className="h-5 w-5" />
                                </div>
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Free Delivery</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                                    <ShieldCheck className="h-5 w-5" />
                                </div>
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">2 Year Warranty</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Reviews Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-gray-100 dark:border-slate-800">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Customer Reviews ({product.numReviews})</h2>

                <div className="">
                    {/* Rating Graph & List */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Rating Distribution Graph */}
                        <div className="lg:col-span-4 h-fit sticky top-24 space-y-8">
                            <div className="bg-gray-50 dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Rating Breakdown</h3>
                                <div className="space-y-3">
                                    {[5, 4, 3, 2, 1].map((star) => {
                                        const count = product.reviews.filter(r => r.rating === star).length;
                                        const total = product.reviews.length;
                                        const percentage = total === 0 ? 0 : (count / total) * 100;

                                        return (
                                            <div key={star} className="flex items-center gap-3 text-sm">
                                                <div className="flex items-center w-12 gap-1">
                                                    <span className="font-bold text-slate-700 dark:text-slate-300">{star}</span>
                                                    <Star className="h-3 w-3 text-gray-400" />
                                                </div>
                                                <div className="flex-1 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-yellow-400 rounded-full"
                                                        style={{ width: `${percentage}%` }}
                                                    ></div>
                                                </div>
                                                <div className="w-10 text-right text-gray-500 dark:text-gray-400">
                                                    {percentage.toFixed(0)}%
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Review List */}
                        <div className="lg:col-span-8 space-y-6">
                            {product.reviews.length === 0 && (
                                <div className="text-center py-12 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700">
                                    <div className="flex justify-center mb-4">
                                        <div className="p-4 bg-white dark:bg-slate-900 rounded-full shadow-sm">
                                            <Star className="h-8 w-8 text-gray-300" />
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No reviews yet</h3>
                                    <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto">Be the first to share your thoughts on this product with the community.</p>
                                </div>
                            )}
                            {product.reviews.map((review) => (
                                <div key={review._id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-lg">
                                                {review.name.charAt(0)}
                                            </div>
                                            <div>
                                                <span className="font-bold text-slate-900 dark:text-white block">{review.name}</span>
                                                <div className="flex text-yellow-400 text-xs mt-0.5">
                                                    {[...Array(5)].map((_, r) => (
                                                        <Star key={r} className={`h-3 w-3 ${r < review.rating ? 'fill-current' : 'text-gray-200 dark:text-slate-600'}`} />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-400 font-medium bg-gray-50 dark:bg-slate-900 px-2 py-1 rounded-lg">
                                            {review.createdAt?.substring(0, 10)}
                                        </div>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{review.comment}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>



            {/* Related Products */}
            <AnimatePresence>
                {relatedProducts.length > 0 && (
                    <motion.section
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 border-t border-gray-100 dark:border-slate-800 pt-16"
                    >
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-10 flex items-center gap-3">
                            <span className="w-2 h-8 bg-indigo-600 rounded-full"></span>
                            You May Also Like
                        </h2>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
                            {relatedProducts.map((p, index) => (
                                <motion.div
                                    key={p._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: index * 0.1 }}
                                >
                                    <Link to={`/product/${p._id}`} className="group block bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-slate-700 h-full">
                                        <div className="aspect-[1/1] overflow-hidden bg-gray-50 dark:bg-slate-900 relative">
                                            <img
                                                src={getImageUrl(p.image)}
                                                alt={p.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                            {p.countInStock === 0 && (
                                                <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-red-500 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-[10px] font-bold uppercase tracking-wider">
                                                    Out of Stock
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-3 sm:p-6">
                                            <div className="text-[8px] sm:text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1 sm:mb-2 px-1.5 sm:py-0.5 bg-indigo-50 dark:bg-indigo-900/30 w-fit rounded-full">
                                                {p.category}
                                            </div>
                                            <h3 className="font-bold text-slate-800 dark:text-white truncate mb-1 sm:mb-2 text-sm sm:text-lg group-hover:text-indigo-600 transition-colors">
                                                {p.name}
                                            </h3>
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-2 sm:mt-4 gap-1">
                                                <p className="text-base sm:text-2xl font-black text-slate-900 dark:text-white">
                                                    ₹{p.price.toLocaleString()}
                                                </p>
                                                <div className="flex items-center gap-1 text-yellow-400">
                                                    <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-current" />
                                                    <span className="text-[10px] sm:text-sm font-bold text-slate-600 dark:text-gray-400">{p.rating}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>

                        {/* View More Button */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="mt-12 flex justify-center"
                        >
                            <Link
                                to={`/products?category=${encodeURIComponent(product.category)}`}
                                className="group flex items-center gap-3 px-8 py-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-full font-bold text-slate-700 dark:text-white hover:bg-slate-900 dark:hover:bg-indigo-600 hover:text-white hover:border-slate-900 dark:hover:border-indigo-600 transition-all duration-300 shadow-sm hover:shadow-xl active:scale-95"
                            >
                                View More in {product.category}
                                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </motion.div>
                    </motion.section>
                )}
            </AnimatePresence>

            <Footer />
        </div >
    );
};

export default ProductDetail;
