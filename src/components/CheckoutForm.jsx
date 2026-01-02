import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { QRCodeSVG } from 'qrcode.react';
import api from '../services/api';
import { Loader, Lock, CreditCard, QrCode, Smartphone } from 'lucide-react';

import { useToast } from '../context/ToastContext';
import { playSuccessSound, initializeAudio } from '../utils/audio';

const CheckoutForm = ({ cart, user, total, shippingAddress, clearCart, onDisplaySuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('card'); // 'card' or 'upi'
    const [upiId, setUpiId] = useState('');

    const createOrder = async (payMethod) => {
        const orderData = {
            orderItems: cart.map(item => ({
                name: item.name,
                qty: item.quantity,
                image: item.image,
                price: item.price,
                product: item._id || item.id
            })),
            shippingAddress,
            paymentMethod: payMethod,
            itemsPrice: total, // simplified
            taxPrice: 0,
            shippingPrice: 0,
            totalPrice: total
        };
        const { data } = await api.post('/orders', orderData);
        return data; // createdOrder
    };

    const handleCardPayment = async (e) => {
        e.preventDefault();
        initializeAudio(); // Prepare audio context for mobile
        if (!stripe || !elements) return;
        if (!validateShipping()) return;

        setLoading(true);
        setError(null);

        try {
            const createdOrder = await createOrder('Stripe');

            // Amount in cents
            const amountInCents = Math.round(createdOrder.totalPrice * 100);
            const { data: { clientSecret } } = await api.post('/orders/create-payment-intent', { amount: amountInCents });

            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                    billing_details: {
                        name: user.name,
                        email: user.email,
                        address: {
                            line1: shippingAddress.address,
                            city: shippingAddress.city,
                            postal_code: shippingAddress.postalCode,
                            country: 'US',
                        }
                    }
                }
            });

            if (result.error) {
                throw new Error(result.error.message);
            }

            if (result.paymentIntent.status === 'succeeded') {
                await markOrderPaid(createdOrder._id, result.paymentIntent.id, 'Stripe');
            }

        } catch (err) {
            console.error("Payment failed", err);
            const msg = err.response?.data?.message || err.message || "Payment failed";
            setError(msg);
            showToast(msg, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleUPIPayment = async (e) => {
        e.preventDefault();
        initializeAudio(); // Prepare audio context for mobile
        if (!validateShipping()) return;

        setLoading(true);
        setError(null);

        try {
            // Simulate UPI delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            const createdOrder = await createOrder('UPI');

            // Mock successful UPI transaction
            const mockTxId = `UPI-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

            await markOrderPaid(createdOrder._id, mockTxId, 'UPI');

        } catch (err) {
            console.error("UPI Payment failed", err);
            const msg = err.response?.data?.message || err.message || "UPI Payment verification failed";
            setError(msg);
            showToast(msg, "error");
        } finally {
            setLoading(false);
        }
    };

    const markOrderPaid = async (orderId, txId, provider) => {
        const paymentResult = {
            id: txId,
            status: 'completed',
            update_time: String(Date.now()),
            email_address: user.email,
            payer: { email_address: user.email }
        };
        await api.put(`/orders/${orderId}/pay`, paymentResult);
        // Delay success sound 3 seconds
        setTimeout(() => {
            playSuccessSound();
        }, 3000);

        showToast("Payment successful! Order placed.", "success");
        clearCart();

        // Delay callback slightly to let toast be seen if needed, 
        // though toast persists across re-renders if context is high enough.
        // onDisplaySuccess switches the view.
        setTimeout(() => {
            onDisplaySuccess();
        }, 1000);
    };

    const validateShipping = () => {
        if (!shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.country || !shippingAddress.phoneNumber) {
            setError("Please fill in all shipping fields");
            return false;
        }
        return true;
    };

    const cardStyle = {
        style: {
            base: {
                color: "#32325d",
                fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                fontSmoothing: "antialiased",
                fontSize: "16px",
                "::placeholder": { color: "#aab7c4" }
            },
            invalid: { color: "#fa755a", iconColor: "#fa755a" }
        }
    };

    // Generate a Dummy UPI string for QR Code
    // format: upi://pay?pa=<vpa>&pn=<name>&am=<amount>&cu=<currency>
    const finalTotal = Number(total).toFixed(2);
    const upiString = `upi://pay?pa=shopvibe@upi&pn=ShopVibe&am=${finalTotal}&cu=INR`;

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex p-1 bg-gray-100 dark:bg-slate-700 rounded-xl">
                <button
                    onClick={() => { setActiveTab('card'); setError(null); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === 'card' ? 'bg-white dark:bg-slate-600 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                >
                    <CreditCard className="h-4 w-4" /> Card
                </button>
                <button
                    onClick={() => { setActiveTab('upi'); setError(null); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === 'upi' ? 'bg-white dark:bg-slate-600 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                >
                    <QrCode className="h-4 w-4" /> UPI / QR
                </button>
            </div>

            {activeTab === 'card' ? (
                <form onSubmit={handleCardPayment} className="space-y-6 fade-in">
                    <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50/50 dark:bg-slate-700/30">
                        <div className="flex items-center gap-2 mb-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                            <Lock className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                            Secure Credit Card Payment
                        </div>
                        <div className="p-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg shadow-sm">
                            <CardElement options={{
                                style: {
                                    base: {
                                        color: "#32325d", // Keeping default for now as dynamic theme switching for Stripe requires context
                                        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                                        fontSmoothing: "antialiased",
                                        fontSize: "16px",
                                        "::placeholder": { color: "#aab7c4" }
                                    },
                                    invalid: { color: "#fa755a", iconColor: "#fa755a" }
                                }
                            }} />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-sm rounded-lg border border-red-100 dark:border-red-900">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={!stripe || loading}
                        className="w-full py-4 bg-slate-900 dark:bg-indigo-600 text-white rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader className="animate-spin h-5 w-5" /> : `Pay ₹${finalTotal}`}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleUPIPayment} className="space-y-6 fade-in">
                    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-indigo-200 dark:border-indigo-800 rounded-xl bg-indigo-50/30 dark:bg-indigo-900/20">
                        <div className="bg-white p-4 rounded-xl shadow-sm mb-4">
                            <QRCodeSVG value={upiString} size={180} />
                        </div>
                        <p className="text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Scan to Pay</p>
                        <p className="text-xs text-slate-500 dark:text-gray-400">Supported by all UPI Apps</p>
                    </div>

                    <div className="space-y-3">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Smartphone className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Enter your UPI ID (e.g. name@upi)"
                                className="pl-10 w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white dark:placeholder-gray-400"
                                value={upiId}
                                onChange={(e) => setUpiId(e.target.value)}
                                required
                            />
                        </div>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 text-center">
                            Note: This is a demo. No real money will be deducted via UPI.
                        </p>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-sm rounded-lg border border-red-100 dark:border-red-900">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader className="animate-spin h-5 w-5" /> : `Verify & Pay ₹${finalTotal}`}
                    </button>
                </form>
            )}
        </div>
    );
};

export default CheckoutForm;
