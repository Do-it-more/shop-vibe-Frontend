import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';
import { Check, Truck, Package, MapPin, CreditCard, Calendar, ArrowLeft, Printer, AlertCircle, X } from 'lucide-react';
import Barcode from 'react-barcode';

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

    const handlePrint = () => {
        window.print();
    };

    const [showComplaintModal, setShowComplaintModal] = useState(false);
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [submitLoading, setSubmitLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const submitComplaint = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        setMessage({ type: '', text: '' });
        try {
            await api.post('/complaints', {
                orderId: id,
                subject,
                description
            });
            setMessage({ type: 'success', text: 'Complaint submitted successfully. We will contact you soon.' });
            setTimeout(() => {
                setShowComplaintModal(false);
                setSubject('');
                setDescription('');
                setMessage({ type: '', text: '' });
            }, 2000);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to submit complaint' });
        } finally {
            setSubmitLoading(false);
        }
    };

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
        { label: 'Shipped', completed: order.isPaid, icon: Truck }, // Simplified logic
        { label: 'Delivered', completed: order.isDelivered, date: order.deliveredAt, icon: Package },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
            <style>{`
                @media print {
                    .page-break { page-break-after: always; break-after: page; }
                }
            `}</style>
            <div className="print:hidden">
                <Navbar />
            </div>

            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full print:p-0 print:max-w-none">
                {/* Print Header */}
                <div className="hidden print:block mb-8 border-b pb-4">
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">INVOICE</h1>
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-gray-600">Order ID: <span className="font-mono font-bold text-slate-900">{order._id}</span></p>
                            <p className="text-gray-600">Date: <span className="font-medium text-slate-900">{new Date(order.createdAt).toLocaleDateString()}</span></p>
                            <div className="mt-4">
                                <Barcode value={order._id} width={1.5} height={50} fontSize={14} displayValue={false} />
                                <p className="text-xs text-center font-mono mt-1">{order._id}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <h2 className="text-xl font-bold text-indigo-600 mb-1">Barlina Fashion</h2>
                            <div className="text-sm text-gray-500 space-y-0.5">
                                <p>123 Fashion Street, T. Nagar</p>
                                <p>Chennai, Tamil Nadu 600017</p>
                                <p>Phone: +91 98765 43210</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center mb-6 print:hidden">
                    <Link to="/orders" className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium">
                        <ArrowLeft className="h-4 w-4" /> Back to Orders
                    </Link>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowComplaintModal(true)}
                            className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors shadow-sm"
                        >
                            <AlertCircle className="h-4 w-4" /> Raise Complaint
                        </button>
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                        >
                            <Printer className="h-4 w-4" /> Print Invoice
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:flex print:flex-col">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6 print:space-y-4 print:order-2">
                        {/* Status Tracker - Hide in Print */}
                        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 print:hidden">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-8">Order Status</h2>
                            {/* ... (Status Tracker Content - reused simplified version logic or kept same) ... */}
                            <div className="relative">
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
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 print:shadow-none print:border print:border-gray-200 print:mb-6">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 print:text-xl print:border-b print:pb-2">Items Purchased</h2>
                            <div className="space-y-4">
                                {order.orderItems.map((item, index) => (
                                    <div key={index} className="flex gap-4 p-2 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition-colors print:p-0 print:border-b print:border-gray-100 print:pb-4">
                                        <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover bg-gray-100 dark:bg-slate-700 print:w-16 print:h-16" />
                                        <div className="flex-1">
                                            <Link to={`/product/${item.product}`} className="font-bold text-slate-800 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 block mb-1 print:text-slate-900 print:text-lg">
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
                    <div className="space-y-6 print:grid print:grid-cols-2 print:gap-8 print:space-y-0 print:order-1 page-break">
                        {/* Shipping Info */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 print:shadow-none print:border print:border-gray-200">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 print:text-lg">
                                <MapPin className="h-4 w-4 text-indigo-500" /> Shipping Address
                            </h3>
                            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1 print:text-base">
                                <p className="font-medium text-slate-800 dark:text-white">{order.user.name}</p>
                                <p>{order.shippingAddress.address}</p>
                                <p>{order.shippingAddress.city}, {order.shippingAddress.country}</p>
                                <p>{order.shippingAddress.postalCode}</p>
                                <p>Phone: {order.user.phoneNumber || 'N/A'}</p>
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 print:shadow-none print:border print:border-gray-200">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 print:text-lg">
                                <CreditCard className="h-4 w-4 text-indigo-500" /> Payment Summary
                            </h3>
                            <div className="space-y-2 text-sm print:text-base">
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
                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 bg-transparent">
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Method: <span className="text-slate-700 dark:text-gray-300">{order.paymentMethod}</span></p>
                                {order.isPaid && (
                                    <span className="inline-block mt-2 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded print:border print:border-green-600">PAID</span>
                                )}
                            </div>
                        </div>

                        {/* Gratitude Quote */}
                        <div className="hidden print:block col-span-2 mt-8 text-center border-t border-gray-200 pt-6">
                            <p className="font-serif italic text-lg text-slate-600">"Thank you for shopping with us! We hope you love your purchase."</p>
                        </div>
                    </div>
                </div>
            </main >
            <div className="print:hidden">
                <Footer />
            </div>

            {/* Complaint Modal */}
            {showComplaintModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm print:hidden">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-700">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-red-500" /> Raise Complaint
                            </h3>
                            <button onClick={() => setShowComplaintModal(false)} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            {message.text && (
                                <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                    {message.text}
                                </div>
                            )}

                            <form onSubmit={submitComplaint} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Subject</label>
                                    <select
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    >
                                        <option value="">Select an issue</option>
                                        <option value="Damaged Product">Damaged Product</option>
                                        <option value="Wrong Item Received">Wrong Item Received</option>
                                        <option value="Delay in Delivery">Delay in Delivery</option>
                                        <option value="Payment Issue">Payment Issue</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Description</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        required
                                        rows="4"
                                        placeholder="Please describe your issue in detail..."
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    disabled={submitLoading}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitLoading ? 'Submitting...' : 'Submit Complaint'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderDetail;
