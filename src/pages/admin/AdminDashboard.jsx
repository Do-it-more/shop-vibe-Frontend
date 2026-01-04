import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line
} from 'recharts';
import { IndianRupee, ShoppingBag, Users, Package, TrendingUp, Download } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const AdminDashboard = () => {
    const { showToast } = useToast();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/reports/dashboard');
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="text-center py-20">Loading dashboard...</div>;
    if (!stats) return <div className="text-center py-20 text-red-500">Failed to load stats.</div>;

    const cards = [
        { title: 'Total Revenue', value: `₹${stats.totalRevenue.toFixed(2)}`, icon: IndianRupee, color: 'green' },
        { title: 'Total Orders', value: stats.orderCount, icon: ShoppingBag, color: 'blue' },
        { title: 'Total Users', value: stats.userCount, icon: Users, color: 'purple' },
        { title: 'Products', value: stats.productCount, icon: Package, color: 'orange' },
    ];

    const handleDownload = async (type) => {
        try {
            const endpoint = `/reports/${type}/download`;
            const response = await api.get(endpoint, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${type}_report_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            showToast(`${type} report downloaded successfully`, "success");
        } catch (error) {
            console.error(`Failed to download ${type} report`, error);
            showToast("Failed to download report. Please try again.", "error");
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Dashboard Overview</h1>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => handleDownload('sales')}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all shadow-sm"
                    >
                        <Download className="h-4 w-4" /> Sales Report
                    </button>
                    <button
                        onClick={() => handleDownload('orders')}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-sm"
                    >
                        <Download className="h-4 w-4" /> Order Report
                    </button>
                    <button
                        onClick={() => handleDownload('complaints')}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold transition-all shadow-sm"
                    >
                        <Download className="h-4 w-4" /> Complaint Report
                    </button>
                </div>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, index) => (
                    <div key={index} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">{card.title}</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{card.value}</h3>
                        </div>
                        <div className={`p-4 rounded-xl bg-${card.color}-500/10 text-${card.color}-600 dark:text-${card.color}-400`}>
                            <card.icon className="h-6 w-6" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Sales Chart */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Sales Overview</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.dailyOrders}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                <XAxis dataKey="_id" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="sales" stroke="#4F46E5" fillOpacity={1} fill="url(#colorSales)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Orders by Status */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Order Status</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[stats.ordersByStatus]}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="name" hide />
                                <YAxis stroke="#9ca3af" />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                                <Bar dataKey="paid" name="Paid" fill="#10B981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="delivered" name="Delivered" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="pending" name="Pending" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                        <div className="flex justify-center gap-6 mt-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <div className="w-3 h-3 rounded-full bg-emerald-500"></div> Paid
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <div className="w-3 h-3 rounded-full bg-blue-500"></div> Delivered
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <div className="w-3 h-3 rounded-full bg-amber-500"></div> Pending
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Workaround if Area/AreaChart was not imported above:
import { AreaChart, Area } from 'recharts';

export default AdminDashboard;
