import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';
import { Check, Truck, Package, MapPin, CreditCard, Calendar, ArrowLeft, Printer, AlertCircle, X, Star, XCircle, FileText } from 'lucide-react';
import Barcode from 'react-barcode';

const OrderDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const { showToast } = useToast();
    const { confirm } = useConfirm();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    const handleCancelOrder = async () => {
        const isConfirmed = await confirm('Cancel Order', 'Are you sure you want to cancel this order? This action cannot be undone.');
        if (isConfirmed) {
            try {
                await api.put(`/orders/${id}/cancel`);
                fetchOrder(); // Refresh order details
                showToast('Order cancelled successfully.', 'success');
            } catch (error) {
                console.error("Failed to cancel order", error);
                showToast(error.response?.data?.message || 'Failed to cancel order', 'error');
            }
        }
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

    // Review Modal State
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewComment, setReviewComment] = useState('');

    const openReviewModal = (item) => {
        if (user && user.isAdmin) return; // Disable review for admins
        if (order.isCancelled) return; // Disable reviews for cancelled orders

        const productData = {
            _id: item.product._id || item.product,
            name: item.name
        };
        setSelectedProduct(productData);
        setReviewRating(0);
        setReviewComment('');
        setShowReviewModal(true);
    };

    const submitReviewHandler = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        setMessage({ type: '', text: '' });
        try {
            await api.post(`/products/${selectedProduct._id || selectedProduct}/reviews`, {
                rating: reviewRating,
                comment: reviewComment
            });
            setMessage({ type: 'success', text: 'Review submitted successfully!' });
            // Close modal after short delay to show success message
            setTimeout(() => {
                setShowReviewModal(false);
                setMessage({ type: '', text: '' });
            }, 2000);
        } catch (error) {
            console.error(error);
            if (error.response?.status === 404) {
                setMessage({ type: 'error', text: 'This product has been discontinued and cannot be reviewed.' });
            } else {
                setMessage({ type: 'error', text: error.response?.data?.message || 'Error submitting review' });
            }
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
                            {order.invoiceNumber && (
                                <p className="text-gray-600">Invoice #: <span className="font-bold text-slate-900 text-xl">{order.invoiceNumber}</span></p>
                            )}
                            <p className="text-gray-600">Order Ref: <span className="font-mono text-gray-400">#{order.invoiceNumber || order._id}</span></p>
                            <p className="text-gray-600">Date: <span className="font-medium text-slate-900">{new Date(order.createdAt).toLocaleDateString()}</span></p>
                            <div className="mt-4">
                                <p class="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Billed To:</p>
                                <p className="font-bold text-slate-900">{order.user.name}</p>
                                <p className="text-sm text-gray-600">{order.user.email}</p>
                                <p className="text-sm text-gray-600">{order.user.phoneNumber}</p>
                            </div>
                            <div className="mt-4">
                                <Barcode value={order.invoiceNumber || order._id} width={1.5} height={50} fontSize={14} displayValue={false} />
                                <p className="text-xs text-center font-mono mt-1">{order.invoiceNumber || order._id}</p>
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

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 print:hidden gap-4">
                    <div className="w-full md:w-auto">
                        <Link to="/orders" className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium mb-3">
                            <ArrowLeft className="h-4 w-4" /> Back to Orders
                        </Link>
                        {order.invoiceNumber && (
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <FileText className="h-6 w-6 text-indigo-500" />
                                Invoice {order.invoiceNumber}
                            </h2>
                        )}
                    </div>

                    {/* Action Buttons - Stack on mobile, Row on Desktop */}
                    <div className="flex flex-wrap gap-3 w-full md:w-auto">
                        {!order.isCancelled && !order.isDelivered && (
                            <button
                                onClick={handleCancelOrder}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white dark:bg-slate-800 text-red-600 border border-red-200 dark:border-red-900/30 px-4 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shadow-sm font-medium text-sm"
                            >
                                <XCircle className="h-4 w-4" /> Cancel
                            </button>
                        )}
                        <button
                            onClick={() => setShowComplaintModal(true)}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 px-4 py-2.5 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors shadow-sm font-medium text-sm"
                        >
                            <AlertCircle className="h-4 w-4" /> Complaint
                        </button>
                        <button
                            onClick={handlePrint}
                            disabled={order.isCancelled}
                            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-colors shadow-sm font-medium text-sm ${order.isCancelled ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                        >
                            <Printer className="h-4 w-4" /> Invoice
                        </button>
                    </div>
                </div>

                {
                    order.isCancelled && (
                        <div className="mb-6 mx-auto max-w-3xl bg-red-500/10 dark:bg-red-500/10 border border-red-500/20 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg print:hidden">
                            <div className="flex flex-col items-center gap-3">
                                <div className="p-3 bg-red-500/10 rounded-full">
                                    <XCircle className="h-8 w-8 text-red-500" aria-hidden="true" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Order Cancelled</h3>
                                    <p className="text-slate-600 dark:text-slate-300">
                                        This order was cancelled on <span className="font-semibold text-slate-900 dark:text-white">{new Date(order.cancelledAt).toLocaleString()}</span>
                                    </p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                                        The refund will be processed within 7 working days.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                }

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:flex print:flex-col">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6 print:space-y-4 print:order-2">
                        {/* Status Tracker - Hide in Print */}
                        {!order.isCancelled && (
                            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 print:hidden">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-8">Order Status</h2>
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
                        )}

                        {/* Items */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 print:shadow-none print:border print:border-gray-200 print:mb-6">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 print:text-xl print:border-b print:pb-2">Items Purchased</h2>
                            <div className="space-y-4">
                                {order.orderItems.map((item, index) => (
                                    <div
                                        key={index}
                                        onClick={() => item.product && !user?.isAdmin && !order.isCancelled && openReviewModal(item)}
                                        className={`flex gap-4 p-2 rounded-lg transition-colors print:p-0 print:border-b print:border-gray-100 print:pb-4 group relative ${item.product && !user?.isAdmin && !order.isCancelled
                                            ? 'hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer'
                                            : 'opacity-100 cursor-default'
                                            }`}
                                    >
                                        <div className="relative">
                                            <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover bg-gray-100 dark:bg-slate-700 print:w-16 print:h-16" />
                                        </div>
                                        <div className="flex-1">
                                            {item.product ? (
                                                <p className="font-bold text-slate-800 dark:text-white block mb-1 print:text-slate-900 print:text-lg text-left group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                    {item.name}
                                                </p>
                                            ) : (
                                                <span className="font-bold text-gray-400 block mb-1 print:text-slate-900 print:text-lg">
                                                    {item.name} (Unavailable)
                                                </span>
                                            )}
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
                                    <>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Paid on: <span className="text-slate-700 dark:text-gray-300">{new Date(order.paidAt).toLocaleString()}</span></p>
                                        <span className="inline-block mt-2 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded print:border print:border-green-600">PAID</span>
                                    </>
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

            {/* Review Modal */}
            {
                showReviewModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm print:hidden">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-700">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Star className="h-5 w-5 text-yellow-500 fill-current" /> Write a Review
                                </h3>
                                <button onClick={() => setShowReviewModal(false)} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="p-6">
                                <div className="mb-4">
                                    <h4 className="font-medium text-slate-800 dark:text-gray-200">{selectedProduct?.name}</h4>
                                </div>

                                {message.text && (
                                    <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                        {message.text}
                                    </div>
                                )}

                                <form onSubmit={submitReviewHandler} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rating</label>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onClick={() => setReviewRating(s)}
                                                    className={`p-1 transition-transform hover:scale-110 ${s <= reviewRating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                                                >
                                                    <Star className={`h-8 w-8 ${s <= reviewRating ? 'fill-current' : ''}`} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Comment</label>
                                        <textarea
                                            rows="4"
                                            value={reviewComment}
                                            onChange={(e) => setReviewComment(e.target.value)}
                                            required
                                            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                            placeholder="Share your experience..."
                                        ></textarea>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={submitLoading || reviewRating === 0}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {submitLoading ? 'Submitting...' : 'Submit Review'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Complaint Modal */}
            {
                showComplaintModal && (
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
                )
            }
        </div >
    );
};

export default OrderDetail;
