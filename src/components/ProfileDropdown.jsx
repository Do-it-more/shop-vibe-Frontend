import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, LogOut, Camera, X, Loader, Save, Package, LayoutDashboard } from 'lucide-react';
import api from '../services/api';

const ProfileDropdown = () => {
    const { user, logout, setUserData } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState(user?.name || '');
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const dropdownRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setIsEditing(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        setUploading(true);
        try {
            const { data } = await api.put('/users/profile-photo', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setUserData(data); // Update global user state
        } catch (error) {
            console.error("Failed to upload image", error);
            alert("Failed to upload image");
        } finally {
            setUploading(false);
        }
    };

    const handleUpdateName = async () => {
        if (!newName.trim() || newName === user.name) {
            setIsEditing(false);
            return;
        }

        try {
            const { data } = await api.put('/users/profile', { name: newName });
            setUserData(data);
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update name", error);
            alert("Failed to update name");
        }
    };

    // Construct image URL (handle local uploads)
    const getProfileImg = () => {
        if (!user.profilePhoto) return null;
        if (user.profilePhoto.startsWith('http')) return user.profilePhoto;
        return `http://localhost:5001${user.profilePhoto}`;
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors focus:outline-none"
            >
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-slate-600 top-trigger">
                    {user.profilePhoto ? (
                        <img src={getProfileImg()} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold text-sm md:text-base">{user.name.charAt(0).toUpperCase()}</span>
                    )}
                </div>
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-3 w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden z-50 origin-top-right"
                    >
                        <div className="p-6 text-center border-b border-gray-50 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-700/30">
                            <div className="relative inline-block">
                                <div className="w-20 h-20 mx-auto rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center overflow-hidden border-2 border-white dark:border-slate-600 shadow-md relative group">
                                    {user.profilePhoto ? (
                                        <img src={getProfileImg()} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-indigo-600 dark:text-indigo-400 font-bold text-3xl">{user.name.charAt(0).toUpperCase()}</span>
                                    )}

                                    {/* Overlay for upload */}
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
                                    >
                                        <Camera className="h-6 w-6" />
                                    </div>
                                </div>
                                {uploading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-slate-800/80 rounded-full">
                                        <Loader className="h-6 w-6 animate-spin text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />

                            {isEditing ? (
                                <div className="mt-3 flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded focus:outline-none focus:border-indigo-500"
                                        autoFocus
                                    />
                                    <button onClick={handleUpdateName} className="p-1 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded">
                                        <Save className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => setIsEditing(false)} className="p-1 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="mt-3 group cursor-pointer" onClick={() => { setIsEditing(true); setNewName(user.name); }}>
                                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center justify-center gap-2">
                                        {user.name}
                                        {/* <Edit2 className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" /> */}
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                                </div>
                            )}
                        </div>

                        <div className="p-2">
                            <Link
                                to="/orders"
                                onClick={() => setIsOpen(false)}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                            >
                                <Package className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                My Orders / Track
                            </Link>

                            {user.role === 'admin' && (
                                <Link
                                    to="/admin/dashboard"
                                    onClick={() => setIsOpen(false)}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-purple-600 dark:text-purple-400 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors"
                                >
                                    <LayoutDashboard className="h-4 w-4" />
                                    Admin Dashboard
                                </Link>
                            )}
                            <button
                                onClick={() => { setIsEditing(true); setNewName(user.name); }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                            >
                                <User className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                Edit Profile Name
                            </button>
                            <button
                                onClick={logout}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                            >
                                <LogOut className="h-4 w-4" />
                                Sign Out
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProfileDropdown;
