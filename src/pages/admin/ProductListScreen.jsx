import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
    Plus,
    Edit,
    Trash2,
    Search,
    ChevronLeft,
    ChevronRight,
    MoreVertical,
    ArrowUpDown
} from 'lucide-react';

const ProductListScreen = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [loading, setLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

    const fetchProducts = async () => {
        try {
            const { data } = await api.get('/products');
            setProducts(data);
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/categories');
            setCategories(data);
        } catch (error) {
            console.error("Failed to fetch categories");
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const deleteHandler = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await api.delete(`/products/${id}`);
                setProducts(products.filter(product => product._id !== id));
            } catch (error) {
                alert('Failed to delete product');
            }
        }
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedProducts = [...products]
        .filter(product => !selectedCategory || product.category?.toLowerCase() === selectedCategory.toLowerCase())
        .sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Products</h1>

                <div className="flex gap-4">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="">All Categories</option>
                        {categories.map((category) => (
                            <option key={category._id} value={category.name}>
                                {category.name}
                            </option>
                        ))}
                    </select>

                    <Link
                        to="/admin/products/create"
                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                        <Plus className="h-5 w-5" />
                        Add Product
                    </Link>
                </div>
            </div>

            {/* Desktop View */}
            <div className="hidden md:block bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-slate-700/50 text-gray-600 dark:text-gray-300 text-sm uppercase tracking-wider">
                                <th
                                    className="p-4 font-semibold cursor-pointer hover:text-indigo-600 transition-colors select-none"
                                    onClick={() => handleSort('name')}
                                >
                                    <div className="flex items-center gap-2">
                                        Product
                                        {sortConfig.key === 'name' && (
                                            <ArrowUpDown className={`h-4 w-4 ${sortConfig.direction === 'asc' ? 'rotate-0' : 'rotate-180'} transition-transform`} />
                                        )}
                                    </div>
                                </th>
                                <th
                                    className="p-4 font-semibold cursor-pointer hover:text-indigo-600 transition-colors select-none"
                                    onClick={() => handleSort('category')}
                                >
                                    <div className="flex items-center gap-2">
                                        Category
                                        {sortConfig.key === 'category' && (
                                            <ArrowUpDown className={`h-4 w-4 ${sortConfig.direction === 'asc' ? 'rotate-0' : 'rotate-180'} transition-transform`} />
                                        )}
                                    </div>
                                </th>
                                <th
                                    className="p-4 font-semibold cursor-pointer hover:text-indigo-600 transition-colors select-none"
                                    onClick={() => handleSort('price')}
                                >
                                    <div className="flex items-center gap-2">
                                        Price
                                        {sortConfig.key === 'price' && (
                                            <ArrowUpDown className={`h-4 w-4 ${sortConfig.direction === 'asc' ? 'rotate-0' : 'rotate-180'} transition-transform`} />
                                        )}
                                    </div>
                                </th>
                                <th className="p-4 font-semibold">Stock</th>
                                <th className="p-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            {sortedProducts.map((product) => (
                                <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                                            />
                                            <span className="font-medium text-slate-900 dark:text-white line-clamp-1">{product.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-600 dark:text-gray-400 capitalize">{product.category}</td>
                                    <td className="p-4 font-medium text-slate-900 dark:text-white">₹{product.price}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${product.countInStock > 0
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                            }`}>
                                            {product.countInStock > 0 ? `${product.countInStock} in stock` : 'Out of Stock'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                to={`/admin/products/${product._id}/edit`}
                                                className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Link>
                                            <button
                                                onClick={() => deleteHandler(product._id)}
                                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile View */}
            <div className="md:hidden grid grid-cols-1 gap-4">
                {sortedProducts.map((product) => (
                    <div key={product._id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex gap-4">
                        <img
                            src={product.image}
                            alt={product.name}
                            className="w-20 h-20 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-1 truncate">{product.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 capitalize">{product.category}</p>

                            <div className="flex items-center justify-between mt-2">
                                <span className="font-bold text-indigo-600 dark:text-indigo-400">₹{product.price}</span>
                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${product.countInStock > 0
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                    }`}>
                                    {product.countInStock > 0 ? `${product.countInStock} Stock` : 'No Stock'}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col justify-between items-end pl-2 border-l border-gray-100 dark:border-slate-700 ml-2">
                            <Link
                                to={`/admin/products/${product._id}/edit`}
                                className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                            >
                                <Edit className="h-4 w-4" />
                            </Link>
                            <button
                                onClick={() => deleteHandler(product._id)}
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductListScreen;
