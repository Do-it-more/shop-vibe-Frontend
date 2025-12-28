import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
    return (
        <div className="relative bg-gradient-to-br from-pink-50 via-white to-indigo-50 overflow-hidden min-h-[calc(100vh-5rem)] flex items-center">
            {/* ... (rest of the decorative circles) ... */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-300/20 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-pink-300/20 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-12 md:py-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="space-y-8"
                    >
                        {/* ... (New Collection badge and Heading) ... */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 backdrop-blur-sm border border-indigo-100 text-indigo-600 font-semibold text-sm shadow-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                            </span>
                            New Collection 2025
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold text-slate-900 leading-[1.1] tracking-tight">
                            Level Up Your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                                Style Game
                            </span>
                        </h1>

                        <p className="text-lg text-gray-600 max-w-lg leading-relaxed">
                            Explore our curated collection of premium tech and lifestyle gear.
                            Enjoy <span className="font-bold text-slate-800">50% off</span> on top brands this week.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Link to="/products" className="px-8 py-4 bg-slate-900 text-white rounded-full font-semibold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-900/20 hover:shadow-2xl hover:-translate-y-1 group">
                                Shop Now
                                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link to="/products" className="px-8 py-4 bg-white text-slate-900 rounded-full font-semibold border border-gray-200 hover:border-indigo-200 hover:bg-white/80 transition-all shadow-sm hover:shadow-md backdrop-blur-sm flex items-center justify-center">
                                View Collections
                            </Link>
                        </div>

                        <div className="flex items-center gap-8 pt-6 border-t border-gray-200/50">
                            <div className="flex -space-x-4">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                                        <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="user" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 flex items-center gap-1">
                                    4.9 <span className="text-yellow-400">★</span>
                                </p>
                                <p className="text-sm text-gray-500">from 10k+ reviews</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative hidden lg:block"
                    >
                        <div className="relative z-10 w-full aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl">
                            <img
                                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                                alt="Fashion Model"
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
                            />

                            {/* Floating Cards */}
                            <div className="absolute top-10 left-10 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/50 animate-float-slow">
                                <p className="font-bold text-slate-900">Summer Sale</p>
                                <p className="text-pink-500 font-bold">50% OFF</p>
                            </div>

                            <div className="absolute bottom-10 right-10 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/50 flex items-center gap-3 animate-float-reverse">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">₹</div>
                                <div>
                                    <p className="text-xs text-gray-500">Starting at</p>
                                    <p className="font-bold text-slate-900">₹29.99</p>
                                </div>
                            </div>
                        </div>

                        {/* Background blob */}
                        <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-500 to-pink-500 rounded-[3.5rem] -z-10 blur-sm opacity-50 transform rotate-2"></div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
