import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft, Upload, Loader, Link as LinkIcon, Image as ImageIcon, Camera, X, Trash2 } from 'lucide-react';

const ProductEditScreen = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const [images, setImages] = useState([]); // Store array of image URLs
    const [brand, setBrand] = useState('');
    const [category, setCategory] = useState('');
    const [countInStock, setCountInStock] = useState(0);
    const [description, setDescription] = useState('');
    const [categories, setCategories] = useState([]);

    const [uploading, setUploading] = useState(false);
    const [imageInputMethod, setImageInputMethod] = useState('upload'); // 'upload', 'url', 'camera'
    const [urlInput, setUrlInput] = useState('');
    const [loading, setLoading] = useState(false);

    // Camera state
    const [showCamera, setShowCamera] = useState(false);
    const videoRef = useRef(null);
    const [stream, setStream] = useState(null);

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
                // Handle backward compatibility or new array structure
                if (data.images && data.images.length > 0) {
                    setImages(data.images);
                } else if (data.image) {
                    setImages([data.image]);
                }
                setBrand(data.brand);
                setCategory(data.category);
                setCountInStock(data.countInStock);
                setDescription(data.description);
            };
            fetchProduct();
        }
    }, [id, isEditMode]);

    // Cleanup camera stream on unmount
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    const uploadFileHandler = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (images.length >= 4) {
            alert("Maximum 4 images allowed");
            return;
        }

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
            setImages([...images, data]);
            setUploading(false);
        } catch (error) {
            console.error(error);
            setUploading(false);
            alert("Image upload failed");
        }
    };

    const addUrlHandler = () => {
        if (!urlInput) return;
        if (images.length >= 4) {
            alert("Maximum 4 images allowed");
            return;
        }
        setImages([...images, urlInput]);
        setUrlInput('');
    };

    const removeImageHandler = (index) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);
    };

    const startCamera = async () => {
        if (images.length >= 4) {
            alert("Maximum 4 images allowed");
            return;
        }
        setImageInputMethod('camera');
        setShowCamera(true);
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            alert("Could not access camera");
            setShowCamera(false);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setShowCamera(false);
    };

    const capturePhoto = async () => {
        if (!videoRef.current) return;

        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0);

        canvas.toBlob(async (blob) => {
            const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });

            // Reuse upload logic
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
                setImages([...images, data]);
                setUploading(false);
                stopCamera();
            } catch (error) {
                console.error(error);
                setUploading(false);
                alert("Image upload failed");
            }
        }, 'image/jpeg');
    };


    const submitHandler = async (e) => {
        e.preventDefault();

        if (price < 0) {
            alert("Price cannot be negative");
            return;
        }
        if (countInStock < 0) {
            alert("Stock count cannot be negative");
            return;
        }

        setLoading(true);
        try {
            const productData = {
                name,
                price,
                images, // Send array of images
                image: images[0] || '', // Fallback for backward compatibility
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
                                min="0"
                                value={price}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === '') {
                                        setPrice('');
                                    } else {
                                        const num = Number(val);
                                        if (!isNaN(num) && num >= 0) {
                                            setPrice(num);
                                        }
                                    }
                                }}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Stock Count</label>
                            <input
                                type="number"
                                required
                                min="0"
                                value={countInStock}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === '') {
                                        setCountInStock('');
                                    } else {
                                        const num = Number(val);
                                        if (!isNaN(num) && num >= 0) {
                                            setCountInStock(num);
                                        }
                                    }
                                }}
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
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                            Product Images ({images.length}/4)
                        </label>

                        {/* Image Preview Grid */}
                        {images.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                {images.map((img, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={img}
                                            alt={`Product ${index + 1}`}
                                            className="w-full h-24 object-cover rounded-lg border border-gray-200 dark:border-slate-700"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImageHandler(index)}
                                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Input Methods */}
                        {images.length < 4 && !showCamera && (
                            <div className="space-y-4">
                                <div className="flex gap-4">
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
                                    <button
                                        type="button"
                                        onClick={startCamera}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-400 hover:bg-gray-200`}
                                    >
                                        <Camera className="h-4 w-4" /> Camera
                                    </button>
                                </div>

                                {imageInputMethod === 'upload' && (
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
                                                    <p className="text-xs text-gray-400 mt-1">SVG, PNG, JPG (max 4 images)</p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}

                                {imageInputMethod === 'url' && (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={urlInput}
                                            onChange={(e) => setUrlInput(e.target.value)}
                                            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="https://example.com/image.jpg"
                                        />
                                        <button
                                            type="button"
                                            onClick={addUrlHandler}
                                            className="bg-indigo-600 text-white px-6 rounded-xl font-medium hover:bg-indigo-700"
                                        >
                                            Add
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Camera UI */}
                        {showCamera && (
                            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                                <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden max-w-2xl w-full relative">
                                    <button
                                        type="button"
                                        onClick={stopCamera}
                                        className="absolute top-4 right-4 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                                    >
                                        <X className="h-6 w-6" />
                                    </button>
                                    <div className="relative aspect-video bg-black">
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            playsInline
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="p-4 flex justify-center bg-gray-50 dark:bg-slate-900">
                                        <button
                                            type="button"
                                            onClick={capturePhoto}
                                            disabled={uploading}
                                            className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-full font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/30"
                                        >
                                            {uploading ? <Loader className="animate-spin h-6 w-6" /> : <Camera className="h-6 w-6" />}
                                            {uploading ? 'Processing...' : 'Capture Photo'}
                                        </button>
                                    </div>
                                </div>
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
