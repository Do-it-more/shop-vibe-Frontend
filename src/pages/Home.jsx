import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import api from '../services/api';
import { Truck, RotateCcw, ShieldCheck, Award, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const categories = [
    { name: 'Smartphones', image: 'https://images.unsplash.com/photo-1598327771808-1f112a27612d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', count: '120+' },
    { name: 'Laptops', image: 'https://images.unsplash.com/photo-1493119508027-2b584f234d6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', count: '85+' },
    { name: 'Headphones', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', count: '200+' },
    { name: 'Smartwatch', image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', count: '60+' },
];

const features = [
    { icon: Truck, title: "Free Delivery", desc: "On all orders above ₹50" },
    { icon: RotateCcw, title: "Easy Returns", desc: "30-day money back guarantee" },
    { icon: ShieldCheck, title: "Secure Payment", desc: "100% protected transactions" },
    { icon: Award, title: "Top Quality", desc: "Original products guaranteed" },
];

const Home = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const { data } = await api.get('/products');
                // Use first 8 items as featured for now
                setProducts(data.slice(0, 8));
            } catch (error) {
                console.error("Failed to fetch featured products", error);
            }
        };
        fetchProducts();
    }, []);

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-grow">
                <Hero />

                {/* Features Section */}
                <section className="py-12 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {features.map((feature, index) => (
                                <div key={index} className="flex items-center gap-4 p-6 rounded-2xl bg-gray-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 hover:shadow-lg transition-all duration-300 border border-transparent hover:border-gray-100 dark:hover:border-slate-700">
                                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
                                        <feature.icon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white">{feature.title}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{feature.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Categories Section */}
                <section className="py-20 bg-gray-50 dark:bg-slate-800/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-end mb-12">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">Shop by Category</h2>
                                <p className="text-gray-500 dark:text-gray-400">Explore our most popular collections</p>
                            </div>
                            <Link to="/products" className="hidden md:flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold hover:gap-3 transition-all">
                                View All <ArrowRight className="h-5 w-5" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {categories.map((cat, idx) => (
                                <Link key={idx} to={`/category/${cat.name.toLowerCase()}`} className="group relative h-80 rounded-3xl overflow-hidden cursor-pointer">
                                    <img
                                        src={cat.image}
                                        alt={cat.name}
                                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                                    <div className="absolute bottom-6 left-6 text-white">
                                        <p className="text-sm text-gray-300 mb-1">{cat.count}</p>
                                        <h3 className="text-2xl font-bold group-hover:text-indigo-300 transition-colors">{cat.name}</h3>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Featured Products */}
                <section className="py-20 bg-white dark:bg-slate-900">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-2xl mx-auto mb-16">
                            <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm tracking-uppercase mb-2 block">Top Selection</span>
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Featured Products</h2>
                            <p className="text-gray-500 dark:text-gray-400">Hand-picked products just for you. Get the best quality at the best price.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {products.length > 0 ? products.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            )) : (
                                <p className="col-span-full text-center text-gray-400">Loading featured products...</p>
                            )}
                        </div>

                        <div className="mt-12 text-center">
                            <Link to="/products" className="inline-flex items-center gap-2 px-8 py-3 bg-slate-900 dark:bg-slate-700 text-white rounded-full font-semibold hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors">
                                Load More Products
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Promo Banner */}
                <section className="py-20 bg-indigo-900 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3"></div>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            <div className="text-white space-y-6">
                                <h2 className="text-4xl md:text-5xl font-bold leading-tight">Winter Sale is Here! <br /> Get Up To 70% Off</h2>
                                <p className="text-indigo-200 text-lg max-w-md">Don't miss out on the biggest sale of the year. Limited stock available.</p>
                                <Link to="/products" className="px-8 py-3 bg-white text-indigo-900 rounded-full font-bold hover:bg-indigo-50 transition-colors inline-block text-center">
                                    Shop the Sale
                                </Link>
                            </div>
                            <div className="relative">
                                {/* Decorative image or pattern could go here */}
                                <div className="aspect-video bg-indigo-800 rounded-2xl flex items-center justify-center border border-indigo-700">
                                    <p className="text-indigo-400 font-bold text-xl uppercase tracking-widest">Limited Time Offer</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default Home;
