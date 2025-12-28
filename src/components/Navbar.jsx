import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, LogOut, Heart, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useTheme } from '../context/ThemeContext';
import ProfileDropdown from './ProfileDropdown';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [keyword, setKeyword] = useState('');
    const { user, logout } = useAuth();
    const { getCartCount } = useCart();
    const { wishlist } = useWishlist();
    const { theme, toggleTheme } = useTheme();
    const cartCount = getCartCount();
    const navigate = useNavigate();

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        if (keyword.trim()) {
            navigate(`/products?keyword=${keyword}`);
        } else {
            navigate('/products');
        }
    };

    return (
        <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm sticky top-0 z-50 transition-all duration-300 border-b border-transparent dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <Link to="/" className="group flex flex-col items-center justify-center">
                        <span className="font-serif text-2xl md:text-3xl tracking-[0.15em] font-bold text-slate-900 dark:text-white leading-none group-hover:opacity-80 transition-opacity" style={{ fontFamily: '"Playfair Display", serif' }}>
                            BERLINA
                        </span>
                        <span className="text-[10px] md:text-xs tracking-[0.4em] font-light lowercase text-gray-500 dark:text-gray-400 mt-1">
                            fashion design
                        </span>
                    </Link>

                    {/* Desktop Search */}
                    {user && (
                        <form onSubmit={handleSearch} className="hidden md:flex flex-1 mx-12 max-w-lg relative group">
                            <input
                                type="text"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                placeholder="Search for products..."
                                className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-slate-700 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 bg-gray-50 dark:bg-slate-800 dark:text-white transition-all shadow-sm group-hover:shadow-md"
                            />
                            <button type="submit" className="absolute left-4 top-3.5 text-gray-400 group-hover:text-indigo-600 transition-colors">
                                <Search className="h-5 w-5" />
                            </button>
                        </form>
                    )}
                    {!user && <div className="flex-1"></div>}

                    {/* Desktop Icons */}
                    <div className="hidden md:flex items-center space-x-6">
                        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-gray-600 dark:text-gray-300">
                            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </button>

                        {user ? (
                            <>
                                <ProfileDropdown />
                                <Link to="/wishlist" className="text-gray-600 dark:text-gray-300 hover:text-red-500 relative transition-colors group">
                                    <div className="p-2 rounded-full bg-gray-50 dark:bg-slate-800 group-hover:bg-red-50 dark:group-hover:bg-slate-700 transition-colors">
                                        <Heart className={`h-6 w-6 ${wishlist?.length > 0 ? 'fill-red-500 text-red-500' : ''}`} />
                                    </div>
                                </Link>

                                <Link to="/cart" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 relative transition-colors group">
                                    <div className="p-2 rounded-full bg-gray-50 dark:bg-slate-800 group-hover:bg-indigo-50 dark:group-hover:bg-slate-700 transition-colors">
                                        <ShoppingCart className="h-6 w-6" />
                                    </div>
                                    {cartCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm">
                                            {cartCount}
                                        </span>
                                    )}
                                </Link>
                            </>
                        ) : (
                            <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-2 font-medium transition-colors group">
                                <div className="p-2 rounded-full bg-gray-50 dark:bg-slate-800 group-hover:bg-indigo-50 dark:group-hover:bg-slate-700 transition-colors">
                                    <User className="h-5 w-5" />
                                </div>
                                <span className="hidden lg:block">Login</span>
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-4">
                        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-gray-600 dark:text-gray-300">
                            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </button>
                        {user && (
                            <Link to="/cart" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 relative transition-colors">
                                <ShoppingCart className="h-6 w-6" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center border border-white dark:border-slate-900">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                        )}
                        {user && <ProfileDropdown />}
                        <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 focus:outline-none p-2 rounded-md hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 overflow-hidden"
                    >
                        <div className="px-4 pt-6 pb-8 space-y-6">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-gray-50 dark:bg-slate-800 dark:text-white"
                                />
                                <Search className="absolute left-3 top-3.5 text-gray-400 h-5 w-5" />
                            </div>

                            <div className="space-y-4">
                                {user ? (
                                    <>
                                        <div className="flex items-center gap-3 p-2 bg-indigo-50 dark:bg-slate-800 rounded-lg">
                                            {user.profilePhoto ? (
                                                <img src={`http://localhost:5001${user.profilePhoto}`} className="w-10 h-10 rounded-full object-cover" alt={user.name} />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-bold">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-bold text-slate-800 dark:text-white">{user.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                                            </div>
                                        </div>
                                        <Link to="/wishlist" className="flex items-center space-x-3 text-gray-700 dark:text-gray-300 font-medium p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                                            <Heart className="h-5 w-5" />
                                            <span>Start Wishlist</span>
                                        </Link>
                                        <button onClick={logout} className="flex items-center space-x-3 text-red-600 font-medium p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full">
                                            <LogOut className="h-5 w-5" />
                                            <span>Sign Out</span>
                                        </button>
                                    </>
                                ) : (
                                    <Link to="/login" className="flex items-center space-x-3 text-gray-700 dark:text-gray-300 font-medium p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-600 transition-colors">
                                        <User className="h-5 w-5" />
                                        <span>Login / Register</span>
                                    </Link>
                                )}
                            </div>

                            <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Categories</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <Link to="/category/smartphones" className="text-sm text-gray-600 dark:text-gray-300 p-2 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg">Smartphones</Link>
                                    <Link to="/category/laptops" className="text-sm text-gray-600 dark:text-gray-300 p-2 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg">Laptops</Link>
                                    <Link to="/category/headphones" className="text-sm text-gray-600 dark:text-gray-300 p-2 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg">Headphones</Link>
                                    <Link to="/category/smartwatch" className="text-sm text-gray-600 dark:text-gray-300 p-2 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg">Smartwatch</Link>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
