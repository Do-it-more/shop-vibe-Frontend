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
    MoreVertical
} from 'lucide-react';

const ProductListScreen = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        fetchProducts();
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

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Products</h1>
                <Link
                    to="/admin/products/create"
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    <Plus className="h-5 w-5" />
                    Add Product
                </Link>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-slate-700/50 text-gray-600 dark:text-gray-300 text-sm uppercase tracking-wider">
                                <th className="p-4 font-semibold">Product</th>
                                <th className="p-4 font-semibold">Category</th>
                                <th className="p-4 font-semibold">Price</th>
                                <th className="p-4 font-semibold">Stock</th>
                                <th className="p-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            {products.map((product) => (
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
        </div>
    );
};

export default ProductListScreen;
