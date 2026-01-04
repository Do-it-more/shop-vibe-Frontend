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
    Home,
    AlertCircle,
    Tag
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
    const { logout } = useAuth();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
        { path: '/admin/products', icon: Package, label: 'Products' },
        { path: '/admin/categories', icon: List, label: 'Categories' },
        { path: '/admin/users', icon: Users, label: 'Users' },
        { path: '/admin/complaints', icon: AlertCircle, label: 'Complaints' },
        { path: '/admin/coupons', icon: Tag, label: 'Coupons' },
    ];

    // Bottom Nav Items (Priority)
    const bottomNavItems = [
        { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dash' },
        { path: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
        { path: '/admin/products', icon: Package, label: 'Products' },
        { path: '/admin/complaints', icon: AlertCircle, label: 'Complaints' },
    ];

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-slate-900 flex pb-16 md:pb-0">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white fixed inset-y-0 left-0 z-50">
                <div className="flex items-center justify-center h-16 px-6 bg-slate-950 border-b border-slate-800">
                    <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Admin Panel</span>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
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

                    <div className="pt-4 mt-4 border-t border-slate-800">
                        <Link
                            to="/"
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-indigo-400 hover:bg-slate-800 hover:text-indigo-300 transition-colors"
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
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 md:pl-64 transition-all duration-300">
                <header className="bg-white dark:bg-slate-800 shadow-sm z-10 h-16 flex items-center px-6 sticky top-0">
                    <div className="md:hidden font-bold text-lg text-slate-800 dark:text-white">
                        Admin Panel
                    </div>
                    <div className="flex-1"></div>
                    <div className="flex items-center gap-4">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-slate-700 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold">
                            A
                        </div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200 hidden md:block">Admin</span>
                    </div>
                </header>

                <main className="flex-1 overflow-auto p-4 md:p-8">
                    <Outlet />
                </main>
            </div>

            {/* Mobile Bottom Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 pb-safe">
                <div className="flex justify-around items-center h-16">
                    {bottomNavItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive
                                    ? 'text-indigo-600 dark:text-indigo-400'
                                    : 'text-gray-400 dark:text-gray-500'
                                    }`}
                            >
                                <Icon className={`h-6 w-6 ${isActive ? 'fill-current opacity-20' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                                <span className="text-[10px] font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="flex flex-col items-center justify-center w-full h-full space-y-1 text-gray-400 dark:text-gray-500"
                    >
                        <Menu className="h-6 w-6" strokeWidth={2} />
                        <span className="text-[10px] font-medium">Menu</span>
                    </button>
                </div>
            </div>

            {/* Mobile Full Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-[60] bg-slate-900/95 backdrop-blur-sm md:hidden flex flex-col animate-in fade-in slide-in-from-bottom-10 duration-200">
                    <div className="flex items-center justify-between p-6 border-b border-slate-800">
                        <span className="text-xl font-bold text-white">Admin Menu</span>
                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="p-2 rounded-full bg-slate-800 text-gray-400 hover:text-white"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-4 content-start">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname.startsWith(item.path);
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`
                                        flex flex-col items-center justify-center gap-3 p-4 rounded-2xl transition-all border
                                        ${isActive
                                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg'
                                            : 'bg-slate-800 border-slate-700 text-gray-400 hover:bg-slate-700 hover:text-white'
                                        }
                                    `}
                                >
                                    <Icon className="h-8 w-8" />
                                    <span className="font-medium text-sm">{item.label}</span>
                                </Link>
                            );
                        })}
                        <Link
                            to="/"
                            className="col-span-2 flex items-center justify-center gap-3 p-4 rounded-2xl bg-slate-800 border border-slate-700 text-indigo-400 hover:bg-slate-700 transition-colors mt-4"
                        >
                            <Home className="h-5 w-5" />
                            <span className="font-medium">Switch to Shop</span>
                        </Link>
                        <button
                            onClick={logout}
                            className="col-span-2 flex items-center justify-center gap-3 p-4 rounded-2xl bg-red-900/20 border border-red-900/50 text-red-400 hover:bg-red-900/30 transition-colors"
                        >
                            <LogOut className="h-5 w-5" />
                            <span className="font-medium">Sign Out</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminLayout;
