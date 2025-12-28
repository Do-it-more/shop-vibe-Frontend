import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft, Upload, Loader, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';

const ProductEditScreen = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const [image, setImage] = useState('');
    const [brand, setBrand] = useState('');
    const [category, setCategory] = useState('');
    const [countInStock, setCountInStock] = useState(0);
    const [description, setDescription] = useState('');
    const [categories, setCategories] = useState([]);

    const [uploading, setUploading] = useState(false);
    const [imageInputMethod, setImageInputMethod] = useState('upload'); // 'upload' or 'url'
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await api.get('/categories');
                setCategories(data);
                // Set default category if creating new product and categories exist
                if (!isEditMode && data.length > 0 && !category) {
                    setCategory(data[0].name);
                }
            } catch (error) {
                console.error("Failed to fetch categories");
            }
        };

        fetchCategories();

        if (isEditMode) {
            const fetchProduct = async () => {
                const { data } = await api.get(`/products/${id}`);
                setName(data.name);
                setPrice(data.price);
                setImage(data.image);
                setBrand(data.brand);
                setCategory(data.category);
                setCountInStock(data.countInStock);
                setDescription(data.description);
            };
            fetchProduct();
        }
    }, [id, isEditMode]);

    const uploadFileHandler = async (e) => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('image', file);
        setUploading(true);

        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            };

            const { data } = await api.post('/upload', formData, config);
            // Construct full URL if needed, but relative usually works if proxy/base setup is right.
            // Assuming API returns like /uploads/image.jpg
            setImage(`http://localhost:5001${data}`);
            // Note: In production this origin should be dynamic or relative. 
            // For now hardcoding localhost for dev speed as per context.
            setUploading(false);
        } catch (error) {
            console.error(error);
            setUploading(false);
            alert("Image upload failed");
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const productData = {
                name,
                price,
                image,
                brand,
                category,
                countInStock,
                description,
            };

            if (isEditMode) {
                await api.put(`/products/${id}`, productData);
            } else {
                await api.post('/products', productData);
            }
            navigate('/admin/products');
        } catch (error) {
            console.error(error);
            alert("Failed to save product");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <Link to="/admin/products" className="inline-flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-6">
                <ArrowLeft className="h-4 w-4" /> Back to Products
            </Link>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-8">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">
                    {isEditMode ? 'Edit Product' : 'Create Product'}
                </h1>

                <form onSubmit={submitHandler} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Product Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Enter product name"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Price (₹)</label>
                            <input
                                type="number"
                                required
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Stock Count</label>
                            <input
                                type="number"
                                required
                                value={countInStock}
                                onChange={(e) => setCountInStock(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Category</label>
                            <select
                                required
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">Select Category</option>
                                {categories.map((cat) => (
                                    <option key={cat._id} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Brand</label>
                            <input
                                type="text"
                                required
                                value={brand}
                                onChange={(e) => setBrand(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Apple, Samsung, etc."
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Product Image</label>

                        <div className="flex gap-4 mb-4">
                            <button
                                type="button"
                                onClick={() => setImageInputMethod('upload')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${imageInputMethod === 'upload' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-400'}`}
                            >
                                <Upload className="h-4 w-4" /> Upload
                            </button>
                            <button
                                type="button"
                                onClick={() => setImageInputMethod('url')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${imageInputMethod === 'url' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-400'}`}
                            >
                                <LinkIcon className="h-4 w-4" /> URL
                            </button>
                        </div>

                        {imageInputMethod === 'upload' ? (
                            <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl p-8 text-center bg-gray-50 dark:bg-slate-900/50 hover:bg-gray-100 transition-colors cursor-pointer relative">
                                {uploading ? (
                                    <div className="flex justify-center">
                                        <Loader className="animate-spin h-8 w-8 text-indigo-600" />
                                    </div>
                                ) : (
                                    <>
                                        <input
                                            type="file"
                                            onChange={uploadFileHandler}
                                            accept="image/*"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <div className="flex flex-col items-center">
                                            <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
                                            <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                                            <p className="text-xs text-gray-400 mt-1">SVG, PNG, JPG or GIF (max. 5MB)</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <input
                                type="text"
                                required={imageInputMethod === 'url'}
                                value={image}
                                onChange={(e) => setImage(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="https://example.com/image.jpg"
                            />
                        )}

                        {image && (
                            <div className="mt-4 p-2 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 inline-block">
                                <span className="text-xs text-gray-500 mb-2 block">Preview</span>
                                <img src={image} alt="Preview" className="h-32 rounded-lg object-cover" />
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Description</label>
                        <textarea
                            required
                            rows="4"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                            placeholder="Product details..."
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || uploading}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-indigo-500/30 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading && <Loader className="animate-spin h-5 w-5" />}
                        {isEditMode ? 'Update Product' : 'Create Product'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProductEditScreen;
