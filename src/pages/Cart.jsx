import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Cart = () => {
    const { cart, updateQuantity, removeFromCart, getCartTotal } = useCart();
    const total = getCartTotal();
    const tax = total * 0.1;
    const shipping = total > 50 ? 0 : 10;
    const finalTotal = total + tax + shipping;

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
            <Navbar />

            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Shopping Cart</h1>

                {cart.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700">
                        <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/40 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag className="h-10 w-10 text-indigo-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your cart is empty</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-8">Looks like you haven't added anything to your cart yet.</p>
                        <Link to="/products" className="inline-flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition-colors">
                            Continue Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            <AnimatePresence>
                                {cart.map((item) => {
                                    // The ID structure depends on populate. If items is [{product: 'id', ...}], then product is the ID.
                                    // If backend returns populated { product: { _id: ... } }, then product._id is ID.
                                    // In my cart controller, I am pushing productId string/ObjectId to `product` field.
                                    // BUT getCart does NO populate in controller!
                                    // So `item.product` IS the ID.
                                    // Wait, in `addToCart`, I push { product: productId, ... }.
                                    // So `item.product` is the ID.
                                    // BUT `Cart.jsx` uses `item._id` or `item.id`.
                                    // `item._id` is the subdocument ID of the item in the array.
                                    // The `updateQuantity` likely expects `productId` (the product's ID), NOT the cart item's ID.
                                    // Checking controller: `const itemIndex = cart.items.findIndex(p => p.product.toString() === productId);`
                                    // It expects PRODUCT ID.
                                    // So I must pass `item.product`.
                                    const id = item.product._id || item.product;
                                    return (
                                        <motion.div
                                            key={id}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -100 }}
                                            className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col sm:flex-row gap-6 items-center"
                                        >
                                            <div className="w-24 h-24 bg-gray-50 dark:bg-slate-700 rounded-xl overflow-hidden flex-shrink-0">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            </div>

                                            <div className="flex-1 text-center sm:text-left">
                                                <h3 className="font-bold text-slate-900 dark:text-white mb-1">{item.name}</h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 capitalize">{item.category}</p>
                                                <div className="font-bold text-indigo-600 dark:text-indigo-400">₹{item.price}</div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center border border-gray-200 dark:border-slate-600 rounded-full bg-gray-50 dark:bg-slate-700">
                                                    <button
                                                        onClick={() => updateQuantity(id, item.quantity - 1)}
                                                        className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </button>
                                                    <span className="w-8 text-center font-bold text-sm text-slate-900 dark:text-white">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(id, item.quantity + 1)}
                                                        className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </button>
                                                </div>

                                                <button
                                                    onClick={() => removeFromCart(id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 sticky top-24 transition-colors">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Order Summary</h2>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                        <span>Subtotal</span>
                                        <span className="font-medium">₹{total.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                        <span>Tax (10%)</span>
                                        <span className="font-medium">₹{tax.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                        <span>Shipping</span>
                                        <span className="font-medium">{shipping === 0 ? <span className="text-green-600 dark:text-green-400">Free</span> : `₹${shipping}`}</span>
                                    </div>
                                    {shipping > 0 && <p className="text-xs text-green-600 dark:text-green-400">Spend ₹{(50 - total).toFixed(2)} more for free delivery</p>}

                                    <div className="h-px bg-gray-100 dark:bg-slate-700 my-4"></div>

                                    <div className="flex justify-between text-lg font-bold text-slate-900 dark:text-white">
                                        <span>Total</span>
                                        <span>₹{finalTotal.toFixed(2)}</span>
                                    </div>
                                </div>

                                <Link to="/checkout" className="block w-full py-4 bg-slate-900 dark:bg-indigo-600 text-white text-center rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2">
                                    Proceed to Checkout
                                    <ArrowRight className="h-4 w-4" />
                                </Link>

                                <div className="mt-6 flex flex-col gap-2">
                                    <p className="text-xs text-gray-400 text-center">We accept</p>
                                    <div className="flex justify-center gap-4 grayscale opacity-60 dark:invert">
                                        {/* Icons would go here */}
                                        <div className="h-6 w-10 bg-gray-200 dark:bg-gray-600 rounded"></div>
                                        <div className="h-6 w-10 bg-gray-200 dark:bg-gray-600 rounded"></div>
                                        <div className="h-6 w-10 bg-gray-200 dark:bg-gray-600 rounded"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default Cart;
