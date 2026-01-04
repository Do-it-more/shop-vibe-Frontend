import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Grid, User, PlayCircle, Package, LayoutDashboard } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const MobileBottomNav = () => {
    const location = useLocation();
    const { theme } = useTheme();
    const { user } = useAuth();

    const isActive = (path) => {
        return location.pathname === path;
    };

    const navItems = [
        { icon: Home, label: 'Home', path: '/' },
        { icon: Grid, label: 'Categories', path: '/products' },
        { icon: User, label: 'Account', path: '/profile' },
        user?.role === 'admin'
            ? { icon: LayoutDashboard, label: 'Admin', path: '/admin/dashboard' }
            : { icon: Package, label: 'My Orders', path: '/orders' }
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 pb-2">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => (
                    <Link
                        key={item.label}
                        to={item.path}
                        className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive(item.path)
                            ? 'text-slate-900 dark:text-white'
                            : 'text-gray-400 dark:text-gray-500'
                            }`}
                    >
                        <item.icon
                            className={`h-6 w-6 ${isActive(item.path) ? 'fill-current' : ''}`}
                            strokeWidth={isActive(item.path) ? 2.5 : 2}
                        />
                        <span className="text-[10px] font-medium">{item.label}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default MobileBottomNav;
