import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '../components/CheckoutForm';
import confetti from 'canvas-confetti';

// Replace with your Stripe Publishable Key
const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');

const Checkout = () => {
    const { cart, getCartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const [isOrderPlaced, setIsOrderPlaced] = useState(false);
    const [form, setForm] = useState({
        address: '',
        city: '',
        postalCode: '',
        country: '',
    });

    const total = getCartTotal();
    const tax = total * 0.1;
    const shipping = total > 50 ? 0 : 10;
    const finalTotal = total + tax + shipping;

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    React.useEffect(() => {
        if (isOrderPlaced) {
            window.scrollTo(0, 0);
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#4f46e5', '#818cf8', '#c7d2fe'] // Indigo shades
            });
        }
    }, [isOrderPlaced]);

    if (isOrderPlaced) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col transition-colors duration-300">
                <Navbar />
                <div className="flex-grow flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-slate-700 max-w-md w-full text-center">
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 dark:text-green-400">
                            <CheckCircle className="h-10 w-10" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Order Placed Successfully!</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-8">Thank you for your purchase. You can check your order status in My Orders.</p>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="w-full py-4 bg-slate-900 dark:bg-indigo-600 text-white rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-indigo-700 transition-colors"
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
                <Footer />
            </div>
        )
    }

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
                <Navbar />
                <div className="flex-grow flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Please Login to Checkout</h2>
                        <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline">Go to Login</Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
            <Navbar />

            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Checkout</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 space-y-8">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Contact Information</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                                        <input type="email" value={user.email} disabled className="w-full px-4 py-3 bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl cursor-not-allowed text-gray-500 dark:text-gray-400" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                                        <input type="text" value={user.name} disabled className="w-full px-4 py-3 bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl cursor-not-allowed text-gray-500 dark:text-gray-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="h-px bg-gray-100 dark:bg-slate-700"></div>

                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Shipping Address</h2>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
                                        <input required name="address" onChange={handleChange} type="text" className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
                                            <input required name="city" onChange={handleChange} type="text" className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">State / Province</label>
                                            <input required name="country" onChange={handleChange} placeholder="State" type="text" className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Postal Code</label>
                                            <input required name="postalCode" onChange={handleChange} type="text" className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="h-px bg-gray-100 dark:bg-slate-700"></div>

                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Payment Method</h2>
                                <Elements stripe={stripePromise}>
                                    <CheckoutForm
                                        cart={cart}
                                        user={user}
                                        total={getCartTotal()}
                                        shippingAddress={form}
                                        clearCart={clearCart}
                                        onDisplaySuccess={() => setIsOrderPlaced(true)}
                                    />
                                </Elements>
                            </div>
                        </div>
                    </div>

                    {/* Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 sticky top-24 transition-colors">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto custom-scrollbar">
                                {cart.map(item => (
                                    <div key={item._id || item.id} className="flex gap-4 p-2 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                        <img src={item.image} alt="" className="w-16 h-16 rounded-md object-cover bg-gray-100 dark:bg-slate-600" />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{item.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                                            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">₹{item.price}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="h-px bg-gray-100 dark:bg-slate-700 my-4"></div>

                            <div className="space-y-2 mb-6">
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                    <span>Subtotal</span>
                                    <span>₹{total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                    <span>Tax</span>
                                    <span>₹{tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                    <span>Shipping</span>
                                    <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold text-slate-900 dark:text-white pt-2 border-t border-gray-100 dark:border-slate-700 mt-2">
                                    <span>Total</span>
                                    <span>₹{finalTotal.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded-lg border border-blue-100 dark:border-blue-900/30">
                                Complete payment details on the left to place order.
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Checkout;
