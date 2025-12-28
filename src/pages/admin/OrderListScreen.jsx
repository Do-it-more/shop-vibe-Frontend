import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Eye, Truck, CheckCircle, Clock } from 'lucide-react';

const OrderListScreen = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { data } = await api.get('/orders');
                setOrders(data);
            } catch (error) {
                console.error("Failed to fetch orders", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const markAsDelivered = async (id) => {
        try {
            await api.put(`/orders/${id}/deliver`);
            setOrders(orders.map(order =>
                order._id === id ? { ...order, isDelivered: true, deliveredAt: new Date().toISOString() } : order
            ));
        } catch (error) {
            alert("Failed to update status");
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Order Management</h1>

            {/* Desktop View */}
            <div className="hidden md:block bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-slate-700/50 text-gray-600 dark:text-gray-300 text-sm uppercase tracking-wider">
                                <th className="p-4 font-semibold">Order ID</th>
                                <th className="p-4 font-semibold">User</th>
                                <th className="p-4 font-semibold">Date</th>
                                <th className="p-4 font-semibold">Total</th>
                                <th className="p-4 font-semibold">Paid</th>
                                <th className="p-4 font-semibold">Delivered</th>
                                <th className="p-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            {orders.map((order) => (
                                <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                                    <td className="p-4 font-mono text-sm">{order._id.substring(0, 10)}...</td>
                                    <td className="p-4 font-medium">{order.user && order.user.name}</td>
                                    <td className="p-4 text-sm text-gray-500">{order.createdAt.substring(0, 10)}</td>
                                    <td className="p-4 font-bold">₹{order.totalPrice.toFixed(2)}</td>
                                    <td className="p-4">
                                        {order.isPaid ? (
                                            <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-bold w-fit">
                                                <CheckCircle className="h-3 w-3" /> Paid
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs font-bold w-fit">
                                                <Clock className="h-3 w-3" /> Pending
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        {order.isDelivered ? (
                                            <span className="text-green-600 font-bold text-sm">Delivered</span>
                                        ) : (
                                            <button
                                                onClick={() => markAsDelivered(order._id)}
                                                className="text-indigo-600 hover:underline text-sm font-semibold"
                                            >
                                                Mark Delivered
                                            </button>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        <Link to={`/order/${order._id}`} className="inline-block p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-lg">
                                            <Eye className="h-4 w-4" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-4">
                {orders.map((order) => (
                    <div key={order._id} className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-mono text-sm font-bold text-slate-800 dark:text-white">#{order._id.substring(0, 8)}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{order.createdAt.substring(0, 10)}</p>
                            </div>
                            <span className="font-bold text-lg text-indigo-600 dark:text-indigo-400">₹{order.totalPrice.toFixed(2)}</span>
                        </div>

                        <div className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                            <p><span className="font-semibold">User:</span> {order.user?.name}</p>
                        </div>

                        <div className="flex items-center justify-between gap-2 mb-4">
                            {order.isPaid ? (
                                <span className="flex items-center gap-1 text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold">
                                    <CheckCircle className="h-3 w-3" /> Paid
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400 px-3 py-1 rounded-full text-xs font-bold">
                                    <Clock className="h-3 w-3" /> Pending
                                </span>
                            )}

                            {order.isDelivered ? (
                                <span className="text-green-600 dark:text-green-400 font-bold text-xs bg-green-50 dark:bg-green-900/10 px-2 py-1 rounded">Delivered</span>
                            ) : (
                                <span className="text-yellow-600 dark:text-yellow-400 font-bold text-xs bg-yellow-50 dark:bg-yellow-900/10 px-2 py-1 rounded">Processing</span>
                            )}
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-slate-700">
                            <Link to={`/order/${order._id}`} className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-white font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
                                <Eye className="h-4 w-4" /> View
                            </Link>
                            {!order.isDelivered && (
                                <button
                                    onClick={() => markAsDelivered(order._id)}
                                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                                >
                                    <Truck className="h-4 w-4" /> Deliver
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrderListScreen;
