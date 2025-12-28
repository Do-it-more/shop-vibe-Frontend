import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Star, ShoppingCart, Minus, Plus, Heart, Truck, ShieldCheck, ArrowLeft, Loader } from 'lucide-react';

const ProductDetail = () => {
    const { id } = useParams();
    const { addToCart } = useCart();
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                // Try to fetch by ID
                const { data } = await api.get(`/products/${id}`);
                setProduct(data);
            } catch (error) {
                console.error("Failed to fetch product", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader className="animate-spin h-10 w-10 text-indigo-600" /></div>;
    if (!product) return <div className="min-h-screen flex items-center justify-center text-xl text-gray-500">Product not found</div>;

    // Simulate multiple images by reusing the main one if multiple not available
    const images = [product.image, product.image, product.image, product.image];

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
                                src={images[activeImage]}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            {product.discount && (
                                <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg">
                                    {product.discount}% OFF
                                </span>
                            )}
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImage(idx)}
                                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-indigo-600 ring-2 ring-indigo-100 dark:ring-indigo-900' : 'border-gray-100 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'}`}
                                >
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
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
                                <span className="text-sm text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">In Stock</span>
                            </div>

                            <div className="flex gap-4">
                                {user ? (
                                    <button
                                        onClick={() => addToCart(product, quantity)}
                                        className="flex-1 bg-slate-900 dark:bg-indigo-600 text-white py-4 rounded-full font-bold text-lg hover:bg-slate-800 dark:hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <ShoppingCart className="h-5 w-5" />
                                        Add to Cart
                                    </button>
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
                                <button className="w-14 h-14 rounded-full border border-gray-200 dark:border-slate-600 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-100 dark:hover:border-red-900 transition-all">
                                    <Heart className="h-6 w-6" />
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
            <Footer />
        </div>
    );
};

export default ProductDetail;
