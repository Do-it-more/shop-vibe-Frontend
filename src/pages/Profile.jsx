import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { User, Mail, Phone, Package, AlertCircle, Clock, CheckCircle, XCircle, X, Plus, Image, Video, Trash2, UploadCloud, MapPin, ChevronDown, ChevronUp, Camera, Edit2, Save, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

const Profile = () => {
    const { user, logout } = useAuth();
    const { showToast } = useToast();
    const { confirm } = useConfirm();
    const [complaints, setComplaints] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showComplaintModal, setShowComplaintModal] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState('');
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [submitLoading, setSubmitLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [selectedImages, setSelectedImages] = useState([]);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [expandedComplaintId, setExpandedComplaintId] = useState(null);
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [tempAddress, setTempAddress] = useState({});
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState('');
    const [showPhotoOptions, setShowPhotoOptions] = useState(false);
    const { setUserData } = useAuth();

    useEffect(() => {
        if (user) {
            // Handle both legacy string and new object address
            if (typeof user.address === 'string') {
                setTempAddress({ street: user.address });
            } else {
                setTempAddress(user.address || {});
            }
            setTempName(user.name || '');
        }
    }, [user]);

    const toggleComplaint = (id) => {
        setExpandedComplaintId(expandedComplaintId === id ? null : id);
    };

    const handleProfilePhotoUpdate = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            const { data } = await api.put('/users/profile-photo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setUserData(data); // key: update context
            showToast('Profile photo updated!', 'success');
        } catch (error) {
            console.error("Failed to update profile photo", error);
            showToast("Failed to update profile photo", "error");
        }
    };

    const handleDeleteProfilePhoto = async () => {
        const isConfirmed = await confirm('Remove Photo', "Are you sure you want to remove your profile photo?");
        if (!isConfirmed) return;
        try {
            const { data } = await api.delete('/users/profile-photo');
            setUserData(data);
            showToast("Profile photo removed!", "success");
        } catch (error) {
            console.error("Failed to remove profile photo", error);
            showToast("Failed to remove profile photo", "error");
        }
    };

    const handleDeleteAccount = async () => {
        const isConfirmed = await confirm('Delete Account', "Are you sure you want to permanently delete your account? This action cannot be undone.");
        if (isConfirmed) {
            try {
                await api.delete('/users/profile');
                showToast("Account deleted successfully", "success");

                // Perform cleanup
                localStorage.removeItem('token');
                sessionStorage.removeItem('token');
                window.location.href = '/login';
            } catch (error) {
                console.error("Failed to delete account", error);
                showToast(error.response?.data?.message || 'Failed to delete account', 'error');
            }
        }
    };

    const handleAddressUpdate = async () => {
        try {
            const { data } = await api.put('/users/profile', { address: tempAddress });
            setUserData(data);
            setIsEditingAddress(false);
            showToast("Address updated!", "success");
        } catch (error) {
            console.error("Failed to update address", error);
            showToast("Failed to update address", "error");
        }
    };

    const handleNameUpdate = async () => {
        try {
            const { data } = await api.put('/users/profile', { name: tempName });
            setUserData(data);
            setIsEditingName(false);
            showToast("Name updated!", "success");
        } catch (error) {
            console.error("Failed to update name", error);
            showToast("Failed to update name", "error");
        }
    };

    const fetchData = async () => {
        try {
            const [complaintsRes, ordersRes] = await Promise.all([
                api.get('/complaints/mycomplaints'),
                api.get('/orders/myorders')
            ]);
            setComplaints(complaintsRes.data);
            setOrders(ordersRes.data);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const submitComplaint = async (e) => {
        e.preventDefault();
        if (!selectedOrderId) {
            setMessage({ type: 'error', text: 'Please select an order' });
            return;
        }
        setSubmitLoading(true);
        setMessage({ type: '', text: '' });

        let uploadedImagePaths = [];
        let uploadedVideoPath = '';

        try {
            // Upload Images
            if (selectedImages.length > 0) {
                const formData = new FormData();
                selectedImages.forEach(file => {
                    formData.append('files', file);
                });

                // Note: /upload/multiple route needs to be verified if it uses 'files' or something else.
                // My backend route uses `upload.array('files', 5)`. Correct.
                const { data } = await api.post('/upload/multiple', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                uploadedImagePaths = data;
            }

            // Upload Video
            if (selectedVideo) {
                const formData = new FormData();
                formData.append('image', selectedVideo); // Reusing 'image' field for single upload middleware

                const { data } = await api.post('/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                uploadedVideoPath = data;
            }

            await api.post('/complaints', {
                orderId: selectedOrderId,
                subject,
                description,
                images: uploadedImagePaths,
                video: uploadedVideoPath
            });

            setMessage({ type: 'success', text: 'Complaint submitted successfully.' });
            fetchData();
            setTimeout(() => {
                setShowComplaintModal(false);
                setSubject('');
                setDescription('');
                setSelectedOrderId('');
                setSelectedImages([]);
                setSelectedVideo(null);
                setImagePreviews([]);
                setMessage({ type: '', text: '' });
            }, 2000);
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to submit complaint' });
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + selectedImages.length > 4) {
            showToast("You can only upload up to 4 images", "error");
            return;
        }
        setSelectedImages(prev => [...prev, ...files]);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(prev => [...prev, ...newPreviews]);
    };

    const removeImage = (index) => {
        const newImages = [...selectedImages];
        newImages.splice(index, 1);
        setSelectedImages(newImages);

        const newPreviews = [...imagePreviews];
        URL.revokeObjectURL(newPreviews[index]);
        newPreviews.splice(index, 1);
        setImagePreviews(newPreviews);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Open': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Resolved': return 'bg-green-100 text-green-800 border-green-200';
            case 'Closed': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
            <Navbar />

            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* User Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 text-center">
                            <div
                                className="w-24 h-24 mx-auto rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mb-4 relative cursor-pointer group"
                                onClick={() => setShowPhotoOptions(!showPhotoOptions)}
                            >
                                {user?.profilePhoto ? (
                                    <div className="w-full h-full rounded-full overflow-hidden">
                                        <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{user?.name?.charAt(0).toUpperCase()}</span>
                                )}

                                {/* Hover Overlay Hint */}
                                <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="h-8 w-8 text-white" />
                                </div>

                                {/* Dropdown Menu */}
                                {showPhotoOptions && (
                                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-48 bg-white dark:bg-slate-700 rounded-xl shadow-xl border border-gray-100 dark:border-slate-600 z-50 overflow-hidden py-1">
                                        <button
                                            className="w-full relative flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors text-left"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Camera className="h-4 w-4" />
                                            <span>Change Photo</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                onChange={(e) => {
                                                    handleProfilePhotoUpdate(e);
                                                    setShowPhotoOptions(false);
                                                }}
                                            />
                                        </button>

                                        {user?.profilePhoto && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteProfilePhoto();
                                                    setShowPhotoOptions(false);
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span>Remove Photo</span>
                                            </button>
                                        )}

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowPhotoOptions(false);
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors text-left border-t border-gray-100 dark:border-slate-600"
                                        >
                                            <X className="h-4 w-4" />
                                            <span>Cancel</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {isEditingName ? (
                                <div className="flex items-center justify-center gap-2 mb-1">
                                    <input
                                        type="text"
                                        value={tempName}
                                        onChange={(e) => setTempName(e.target.value)}
                                        className="text-center font-bold text-slate-900 dark:text-white bg-transparent border-b border-indigo-500 focus:outline-none w-full max-w-[200px]"
                                        autoFocus
                                    />
                                    <button onClick={handleNameUpdate} className="text-green-600 hover:text-green-700">
                                        <Save className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => setIsEditingName(false)} className="text-gray-400 hover:text-gray-600">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2 mb-1 group">
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user?.name}</h2>
                                    <button onClick={() => setIsEditingName(true)} className="text-gray-400 hover:text-indigo-600 transition-colors opacity-0 group-hover:opacity-100">
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                </div>
                            )}
                            <div className="mb-6 flex flex-col gap-1 items-center">
                                <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                                {user?.phoneNumber && <p className="text-sm text-gray-500 dark:text-gray-400">{user.phoneNumber}</p>}
                            </div>

                            <div className="space-y-3 text-left">
                                {isEditingAddress ? (
                                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900 shadow-sm">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-indigo-500" />
                                                <span className="text-sm font-bold text-slate-900 dark:text-white">Edit Address</span>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Address Line 1</label>
                                                <input
                                                    type="text"
                                                    value={tempAddress.street || (typeof tempAddress === 'string' ? tempAddress : '')}
                                                    onChange={(e) => setTempAddress({ ...tempAddress, street: e.target.value })}
                                                    placeholder="Street Address"
                                                    className="w-full text-sm p-3 rounded-lg bg-gray-50 dark:bg-slate-900 border-none ring-1 ring-gray-200 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Address Line 2 (Optional)</label>
                                                <input
                                                    type="text"
                                                    value={tempAddress.addressLine2 || ''} // Using 'addressLine2' to distinguish
                                                    onChange={(e) => setTempAddress({ ...tempAddress, addressLine2: e.target.value })}
                                                    placeholder="Apartment, suite, etc."
                                                    className="w-full text-sm p-3 rounded-lg bg-gray-50 dark:bg-slate-900 border-none ring-1 ring-gray-200 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">City</label>
                                                    <input
                                                        type="text"
                                                        value={tempAddress.city || ''}
                                                        onChange={(e) => setTempAddress({ ...tempAddress, city: e.target.value })}
                                                        placeholder="City"
                                                        className="w-full text-sm p-3 rounded-lg bg-gray-50 dark:bg-slate-900 border-none ring-1 ring-gray-200 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">State</label>
                                                    <input
                                                        type="text"
                                                        value={tempAddress.state || ''}
                                                        onChange={(e) => setTempAddress({ ...tempAddress, state: e.target.value })}
                                                        placeholder="State"
                                                        className="w-full text-sm p-3 rounded-lg bg-gray-50 dark:bg-slate-900 border-none ring-1 ring-gray-200 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Postal Code</label>
                                                    <input
                                                        type="text"
                                                        value={tempAddress.postalCode || ''}
                                                        onChange={(e) => setTempAddress({ ...tempAddress, postalCode: e.target.value })}
                                                        placeholder="Postal Code"
                                                        className="w-full text-sm p-3 rounded-lg bg-gray-50 dark:bg-slate-900 border-none ring-1 ring-gray-200 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Country</label>
                                                    <input
                                                        type="text"
                                                        value={tempAddress.country || ''}
                                                        onChange={(e) => setTempAddress({ ...tempAddress, country: e.target.value })}
                                                        placeholder="Country"
                                                        className="w-full text-sm p-3 rounded-lg bg-gray-50 dark:bg-slate-900 border-none ring-1 ring-gray-200 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                                                    />
                                                </div>
                                            </div>
                                            {/* Phone Number Field integrated into Address Form */}
                                            <div>
                                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Phone Number</label>
                                                <input
                                                    type="tel"
                                                    value={tempAddress.phoneNumber || ''}
                                                    onChange={(e) => setTempAddress({ ...tempAddress, phoneNumber: e.target.value })}
                                                    placeholder="Phone Number"
                                                    className="w-full text-sm p-3 rounded-lg bg-gray-50 dark:bg-slate-900 border-none ring-1 ring-gray-200 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-3 justify-end mt-3">
                                            <button
                                                onClick={() => setIsEditingAddress(false)}
                                                className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleAddressUpdate}
                                                className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                                            >
                                                <Save className="h-3 w-3" />
                                                Save Address
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between gap-3 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-slate-700/50 p-3 rounded-lg group">
                                        <div className="flex items-start gap-3 overflow-hidden">
                                            <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                            <div className="flex flex-col gap-0.5">
                                                {user?.address && typeof user.address === 'object' && (user.address.street || user.address.city) ? (
                                                    <>
                                                        <span className="font-medium text-slate-900 dark:text-white">{user.address.street}</span>
                                                        {user.address.addressLine2 && <span className="text-gray-500 dark:text-gray-400">{user.address.addressLine2}</span>}
                                                        <span>{user.address.city}, {user.address.state} {user.address.postalCode}</span>
                                                        <span>{user.address.country}</span>
                                                    </>
                                                ) : (
                                                    <span className="truncate">{typeof user?.address === 'string' ? user.address : 'No address set'}</span>
                                                )}
                                                <div className="flex items-center gap-2 mt-1 pt-1 border-t border-gray-200 dark:border-slate-600">
                                                    <Phone className="h-3 w-3" />
                                                    <span>{user.address?.phoneNumber || 'No shipping phone added'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => setIsEditingAddress(true)} className="text-gray-400 hover:text-indigo-600 transition-colors self-start">
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-700 space-y-3">
                                <button
                                    onClick={logout}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/30 dark:text-indigo-400 rounded-xl transition-colors"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Sign Out
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-400 rounded-xl transition-colors"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="lg:col-span-3 space-y-8">
                        {/* Complaints Section */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5 text-red-500" /> My Complaints
                                </h3>
                                <button
                                    onClick={() => setShowComplaintModal(true)}
                                    className="flex items-center gap-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg font-medium transition-colors"
                                >
                                    <Plus className="h-4 w-4" /> Raise New Complaint
                                </button>
                            </div>

                            {loading ? (
                                <div className="p-8 text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                                </div>
                            ) : complaints.length === 0 ? (
                                <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                                    <p>No complaints found. That's a good thing!</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100 dark:divide-slate-700">
                                    {complaints.map((complaint) => (
                                        <div key={complaint._id} className="transition-colors hover:bg-gray-50 dark:hover:bg-slate-700/30">
                                            {/* Header - Clickable to Toggle */}
                                            <button
                                                onClick={() => toggleComplaint(complaint._id)}
                                                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                                            >
                                                <div className="flex-1 min-w-0 pr-4">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h4 className="text-base font-bold text-slate-900 dark:text-white truncate">
                                                            {complaint.subject}
                                                        </h4>
                                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wide ${getStatusColor(complaint.status)}`}>
                                                            {complaint.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        <span className="font-mono text-xs">#{complaint._id.slice(-6).toUpperCase()}</span> • Order #{complaint.order?.invoiceNumber || complaint.order?._id.slice(-6).toUpperCase()} • {new Date(complaint.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="text-gray-400 dark:text-gray-500">
                                                    {expandedComplaintId === complaint._id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                                </div>
                                            </button>

                                            {/* Expanded Content */}
                                            {expandedComplaintId === complaint._id && (
                                                <div className="px-6 pb-6 pt-0 animate-in slide-in-from-top-2 duration-200">
                                                    <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4 border border-gray-100 dark:border-slate-700 space-y-4">
                                                        <div>
                                                            <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</h5>
                                                            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                                                                {complaint.description}
                                                            </p>
                                                        </div>

                                                        {/* Evidence Previews */}
                                                        {((complaint.images && complaint.images.length > 0) || complaint.video) && (
                                                            <div>
                                                                <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Attachments</h5>
                                                                <div className="flex gap-2">
                                                                    {complaint.images?.length > 0 && (
                                                                        <span className="text-xs text-indigo-600 flex items-center gap-1"><Image className="h-3 w-3" /> {complaint.images.length} Image(s)</span>
                                                                    )}
                                                                    {complaint.video && (
                                                                        <span className="text-xs text-indigo-600 flex items-center gap-1"><Video className="h-3 w-3" /> Video</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {complaint.adminResponse && (
                                                            <div className="border-t border-gray-200 dark:border-slate-700 pt-3 mt-3">
                                                                <h5 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                                    <CheckCircle className="h-3 w-3" /> Admin Response
                                                                </h5>
                                                                <p className="text-sm text-slate-800 dark:text-slate-200 bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800/30">
                                                                    {complaint.adminResponse}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main >
            <Footer />

            {/* Complaint Modal */}
            {
                showComplaintModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm print:hidden">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-700">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5 text-red-500" /> Raise New Complaint
                                </h3>
                                <button onClick={() => setShowComplaintModal(false)} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="p-6">
                                {message.text && (
                                    <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                        {message.text}
                                    </div>
                                )}

                                <form onSubmit={submitComplaint} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Select Order</label>
                                        <select
                                            value={selectedOrderId}
                                            onChange={(e) => setSelectedOrderId(e.target.value)}
                                            required
                                            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        >
                                            <option value="">-- Choose an Order --</option>
                                            {orders.map(order => (
                                                <option key={order._id} value={order._id}>
                                                    {order.invoiceNumber ? `Invoice #${order.invoiceNumber}` : `Order #${order._id.slice(-6).toUpperCase()}`} - {new Date(order.createdAt).toLocaleDateString()} - ₹{order.totalPrice}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Subject</label>
                                        <select
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                            required
                                            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        >
                                            <option value="">Select an issue</option>
                                            <option value="Damaged Product">Damaged Product</option>
                                            <option value="Wrong Item Received">Wrong Item Received</option>
                                            <option value="Product Quality Issue">Product Quality Issue</option>
                                            <option value="Size/Fit Issue">Size/Fit Issue</option>
                                            <option value="Delay in Delivery">Delay in Delivery</option>
                                            <option value="Payment Issue">Payment Issue</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Description</label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            required
                                            rows="4"
                                            placeholder="Please describe your issue in detail..."
                                            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        ></textarea>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Attachments (Optional)</label>

                                        {/* Images */}
                                        <div className="mb-4">
                                            <p className="text-xs text-gray-500 mb-2">Images (Max 4)</p>
                                            <div className="grid grid-cols-4 gap-2">
                                                {imagePreviews.map((src, index) => (
                                                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                                                        <img src={src} alt="Preview" className="w-full h-full object-cover" />
                                                        <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded-full hover:bg-red-600">
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                                {selectedImages.length < 4 && (
                                                    <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-600 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors">
                                                        <Image className="h-6 w-6 text-gray-400 group-hover:text-indigo-500" />
                                                        <span className="text-[10px] text-gray-500 mt-1">Add Image</span>
                                                        <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                                                    </label>
                                                )}
                                            </div>
                                        </div>

                                        {/* Video */}
                                        <div>
                                            <p className="text-xs text-gray-500 mb-2">Video (Max 1)</p>
                                            {selectedVideo ? (
                                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600">
                                                    <div className="flex items-center gap-2 overflow-hidden">
                                                        <Video className="h-5 w-5 text-indigo-500 flex-shrink-0" />
                                                        <span className="text-sm truncate text-gray-700 dark:text-gray-200">{selectedVideo.name}</span>
                                                    </div>
                                                    <button type="button" onClick={() => setSelectedVideo(null)} className="text-red-500 hover:text-red-600">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <label className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-600 cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors">
                                                    <Video className="h-5 w-5 text-gray-400" />
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">Upload Video Evidence</span>
                                                    <input type="file" accept="video/*" onChange={(e) => setSelectedVideo(e.target.files[0])} className="hidden" />
                                                </label>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={submitLoading}
                                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {submitLoading ? 'Submitting...' : 'Submit Complaint'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
        </div>
    );
};

export default Profile;
