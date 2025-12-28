import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';
import { Check, Truck, Package, MapPin, CreditCard, Calendar, ArrowLeft } from 'lucide-react';

const OrderDetail = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const { data } = await api.get(`/orders/${id}`);
                setOrder(data);
            } catch (error) {
                console.error("Failed to fetch order", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    if (!order) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <p className="text-xl text-gray-500">Order not found</p>
        </div>
    );

    const steps = [
        { label: 'Order Placed', completed: true, date: order.createdAt, icon: Calendar },
        { label: 'Payment Confirmed', completed: order.isPaid, date: order.paidAt, icon: CreditCard },
        { label: 'Shipped', completed: order.isPaid, icon: Truck }, // Simplified logic: Paid = Shipped for demo
        { label: 'Delivered', completed: order.isDelivered, date: order.deliveredAt, icon: Package },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
            <Navbar />
            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
                <Link to="/orders" className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6 transition-colors font-medium w-fit">
                    <ArrowLeft className="h-4 w-4" /> Back to Orders
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Status Tracker */}
                        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-8">Order Status</h2>
                            <div className="relative">
                                {/* Connector Line */}
                                <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-gray-100 dark:bg-slate-700"></div>

                                <div className="space-y-8">
                                    {steps.map((step, index) => {
                                        const Icon = step.icon;
                                        return (
                                            <div key={index} className="relative flex items-start gap-4">
                                                <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-4 ${step.completed ? 'bg-indigo-600 border-indigo-100 ring-2 ring-indigo-50 dark:ring-indigo-900/50 dark:border-indigo-900' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600'} transition-all`}>
                                                    {step.completed ? <Check className="h-4 w-4 text-white" /> : <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-slate-600"></div>}
                                                </div>
                                                <div className="pt-1">
                                                    <p className={`font-bold ${step.completed ? 'text-slate-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>{step.label}</p>
                                                    {step.date && (
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{new Date(step.date).toLocaleString()}</p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Items */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Items</h2>
                            <div className="space-y-4">
                                {order.orderItems.map((item, index) => (
                                    <div key={index} className="flex gap-4 p-2 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                        <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover bg-gray-100 dark:bg-slate-700" />
                                        <div className="flex-1">
                                            <Link to={`/product/${item.product}`} className="font-bold text-slate-800 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 block mb-1">
                                                {item.name}
                                            </Link>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Qty: {item.qty} x ₹{item.price}</p>
                                        </div>
                                        <p className="font-bold text-slate-900 dark:text-white">₹{(item.qty * item.price).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Shipping Info */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-indigo-500" /> Shipping Address
                            </h3>
                            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                                <p className="font-medium text-slate-800 dark:text-white">{order.user.name}</p>
                                <p>{order.shippingAddress.address}</p>
                                <p>{order.shippingAddress.city}, {order.shippingAddress.country}</p>
                                <p>{order.shippingAddress.postalCode}</p>
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-indigo-500" /> Payment Summary
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                    <span>Items Total</span>
                                    <span>₹{order.itemsPrice?.toFixed(2) || (order.totalPrice - (order.taxPrice || 0) - (order.shippingPrice || 0)).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                    <span>Shipping</span>
                                    <span>₹{order.shippingPrice?.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                    <span>Tax</span>
                                    <span>₹{order.taxPrice?.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-2 border-t border-gray-100 dark:border-slate-700 mt-2">
                                    <span>Total Paid</span>
                                    <span>₹{order.totalPrice.toFixed(2)}</span>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Method: <span className="text-slate-700 dark:text-gray-300">{order.paymentMethod}</span></p>
                                {order.isPaid && (
                                    <span className="inline-block mt-2 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded">PAID</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default OrderDetail;
