import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    ShoppingBag,
    Users,
    BarChart,
    LogOut,
    Menu,
    X,
    List,
    Home
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
    const { logout } = useAuth();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const navItems = [
        { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/admin/products', icon: Package, label: 'Products' },
        { path: '/admin/categories', icon: List, label: 'Categories' },
        { path: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
        { path: '/admin/users', icon: Users, label: 'Users' },
    ];

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-slate-900 flex">
            {/* Sidebar */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transition-transform duration-300 transform 
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    md:relative md:translate-x-0
                `}
            >
                <div className="flex items-center justify-between h-16 px-6 bg-slate-950 border-b border-slate-800">
                    <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Admin Panel</span>
                    <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <nav className="p-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`
                                    flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
                                    ${isActive
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                        : 'text-gray-400 hover:bg-slate-800 hover:text-white'
                                    }
                                `}
                            >
                                <Icon className="h-5 w-5" />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}

                    <Link
                        to="/"
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-indigo-400 hover:bg-slate-800 hover:text-indigo-300 transition-colors mt-8"
                    >
                        <Home className="h-5 w-5" />
                        <span className="font-medium">Switch to Shop</span>
                    </Link>

                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-slate-800 hover:text-red-300 transition-colors mt-2"
                    >
                        <LogOut className="h-5 w-5" />
                        <span className="font-medium">Logout</span>
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="bg-white dark:bg-slate-800 shadow-sm z-10 h-16 flex items-center px-6">
                    <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-gray-600 dark:text-gray-300 mr-4">
                        <Menu className="h-6 w-6" />
                    </button>
                    <div className="flex-1"></div>
                    <div className="flex items-center gap-4">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-slate-700 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold">
                            A
                        </div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Admin</span>
                    </div>
                </header>

                <main className="flex-1 overflow-auto p-4 md:p-8">
                    <Outlet />
                </main>
            </div>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    onClick={() => setIsSidebarOpen(false)}
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                ></div>
            )}
        </div>
    );
};

export default AdminLayout;
