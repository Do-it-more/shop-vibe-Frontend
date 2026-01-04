import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle } from 'lucide-react';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2, // Stagger effect for children
            delayChildren: 0.3,
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 50, damping: 20 }
    }
};

const floatVariants = {
    animate: {
        y: [0, -15, 0],
        transition: {
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
};

const floatReverseVariants = {
    animate: {
        y: [0, 15, 0],
        transition: {
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
        }
    }
};

const Hero = () => {
    return (
        <div className="relative bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 overflow-hidden min-h-[calc(100vh-5rem)] flex items-center transition-colors duration-300">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-300/20 dark:bg-purple-900/20 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3 animate-pulse-slow"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-300/20 dark:bg-indigo-900/20 rounded-full blur-[120px] -translate-x-1/3 translate-y-1/3 animate-pulse-slow delay-700"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-12 md:py-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                    {/* Left Content */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-8"
                    >
                        {/* Badge */}
                        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-900/50 shadow-[0_4px_20px_-10px_rgba(99,102,241,0.4)]">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600 dark:bg-indigo-400"></span>
                            </span>
                            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 tracking-wide">New Collection 2025</span>
                        </motion.div>

                        {/* Heading */}
                        <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white leading-[1.1] tracking-tight">
                            Level Up Your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 animate-gradient-x">
                                Style Game
                            </span>
                        </motion.h1>

                        {/* Description */}
                        <motion.p variants={itemVariants} className="text-lg text-slate-600 dark:text-slate-300 max-w-lg leading-relaxed font-medium">
                            Explore our curated collection of premium tech and lifestyle gear.
                            Enjoy <span className="text-slate-900 dark:text-white font-bold bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-200 px-1 rounded">50% off</span> on top brands this week.
                        </motion.p>

                        {/* Buttons */}
                        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Link to="/products" className="group relative px-8 py-4 bg-slate-900 dark:bg-indigo-600 text-white rounded-full font-bold overflow-hidden shadow-xl shadow-indigo-500/20 hover:shadow-2xl hover:shadow-indigo-500/30 transition-all">
                                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <span className="relative flex items-center justify-center gap-2">
                                    Shop Now <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </Link>
                            <Link to="/products" className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-full font-bold border border-slate-200 dark:border-slate-700 hover:border-purple-200 dark:hover:border-indigo-500 hover:bg-purple-50 dark:hover:bg-slate-700 transition-all shadow-sm hover:shadow-lg flex items-center justify-center">
                                View Collections
                            </Link>
                        </motion.div>

                        {/* Social Proof */}
                        <motion.div variants={itemVariants} className="flex items-center gap-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex -space-x-4">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-12 h-12 rounded-full border-[3px] border-white dark:border-slate-900 shadow-sm overflow-hidden">
                                        <img src={`https://i.pravatar.cc/100?img=${i + 20}`} alt="user" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                            <div>
                                <div className="flex items-center gap-1 mb-0.5">
                                    <span className="font-bold text-lg text-slate-900 dark:text-white">4.9</span>
                                    <div className="flex text-yellow-400 text-sm">★★★★★</div>
                                </div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">from 10k+ happy reviews</p>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Right Image */}
                    <div className="relative hidden lg:block perspective-1000">
                        <motion.div
                            initial={{ opacity: 0, rotateY: -10, scale: 0.9 }}
                            animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="relative z-10 w-full aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl shadow-indigo-500/20 group"
                        >
                            <img
                                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                                alt="Fashion Model"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />

                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                            {/* Floating Card 1: Sale */}
                            <motion.div
                                variants={floatVariants}
                                animate="animate"
                                className="absolute top-12 left-8 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl p-4 pr-8 rounded-2xl shadow-lg border border-white/60 dark:border-slate-700"
                            >
                                <p className="font-bold text-slate-900 dark:text-white text-sm">Summer Sale</p>
                                <p className="text-pink-600 dark:text-pink-400 font-extrabold text-xl">50% OFF</p>
                            </motion.div>

                            {/* Floating Card 2: Price */}
                            <motion.div
                                variants={floatReverseVariants}
                                animate="animate"
                                className="absolute bottom-12 right-8 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl p-3 pr-6 rounded-2xl shadow-xl border border-white/60 dark:border-slate-700 flex items-center gap-4"
                            >
                                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 shadow-inner">
                                    <span className="font-bold text-lg">₹</span>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">Starting at</p>
                                    <p className="font-bold text-slate-900 dark:text-white text-xl">₹29.99</p>
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Background Glow Element */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[3rem] blur-lg opacity-30 -z-10 transform rotate-3 scale-105"></div>
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-500 rounded-[3rem] blur-lg opacity-30 -z-10 transform -rotate-2 scale-105"></div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Hero;
