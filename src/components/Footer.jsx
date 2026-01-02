import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-white dark:bg-slate-900 pt-16 pb-8 border-t border-gray-100 dark:border-slate-800 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Info */}
                    <div>
                        <Link to="/" className="inline-block mb-6 group">
                            <div className="flex flex-col items-start">
                                <span className="font-serif text-2xl md:text-3xl tracking-[0.15em] font-bold text-slate-900 dark:text-white leading-none group-hover:opacity-80 transition-opacity" style={{ fontFamily: '"Playfair Display", serif' }}>
                                    BARLINA
                                </span>
                                <span className="text-[10px] md:text-xs tracking-[0.4em] font-light lowercase text-gray-500 dark:text-gray-400 mt-1 w-full text-center">
                                    fashion design
                                </span>
                            </div>
                        </Link>
                        <p className="text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                            Discover the latest trends in tech and lifestyle. Quality products, premium service, and fast delivery guaranteed.
                        </p>
                        <div className="flex space-x-4">
                            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, index) => (
                                <a key={index} href="#" className="w-10 h-10 rounded-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white dark:hover:text-white transition-all duration-300">
                                    <Icon className="h-5 w-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Quick Links</h4>
                        <ul className="space-y-4">
                            {[
                                { name: 'Home', path: '/' },
                                { name: 'Shop', path: '/products' },
                                { name: 'About Us', path: '/about' },
                                { name: 'Contact', path: '#' }
                            ].map((item) => (
                                <li key={item.name}>
                                    <Link to={item.path} className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Customer Service</h4>
                        <ul className="space-y-4">
                            {[
                                { name: 'Order Tracking', path: '/orders' },
                                { name: 'Wishlist', path: '/wishlist' },
                                { name: 'Terms & Conditions', path: '#' },
                                { name: 'Privacy Policy', path: '#' },
                                { name: 'Returns', path: '#' }
                            ].map((item) => (
                                <li key={item.name}>
                                    <Link to={item.path} className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Contact Us</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-4 text-gray-500 dark:text-gray-400">
                                <MapPin className="h-6 w-6 text-indigo-600 dark:text-indigo-400 shrink-0" />
                                <span>13/3, Mukasha parur, villupuram -123463</span>
                            </li>
                            <li className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
                                <Phone className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                                <span>+91 88256 35443</span>
                            </li>
                            <li className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
                                <Mail className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                                <span>support@barlinafashion.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-100 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        © {new Date().getFullYear()} Barlina Fashion Design. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4 opacity-50 grayscale hover:grayscale-0 transition-all dark:invert" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6 opacity-50 grayscale hover:grayscale-0 transition-all dark:invert" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-5 opacity-50 grayscale hover:grayscale-0 transition-all dark:invert" />
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
