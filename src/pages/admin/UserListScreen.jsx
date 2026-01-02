import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Trash2, Shield, User, ShieldCheck, Plus } from 'lucide-react';

const UserListScreen = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            const { data } = await api.get('/users');
            setUsers(data);
        };
        fetchUsers();
    }, []);

    const deleteHandler = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await api.delete(`/users/${id}`);
                setUsers(users.filter(user => user._id !== id));
            } catch (error) {
                alert('Failed to delete user');
            }
        }
    };

    const toggleAdminHandler = async (user) => {
        const newRole = user.role === 'admin' ? 'user' : 'admin';
        const action = newRole === 'admin' ? 'promote to Admin' : 'remove Admin privileges from';

        if (window.confirm(`Are you sure you want to ${action} ${user.name}?`)) {
            try {
                const { data } = await api.put(`/users/${user._id}`, { role: newRole });
                // Optimistically update or use response data
                setUsers(users.map(u => u._id === user._id ? { ...u, role: data.role } : u));
            } catch (error) {
                console.error(error);
                alert('Failed to update user role');
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">User Management</h1>
                <Link to="/admin/users/create" className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                    <Plus className="h-5 w-5" />
                    Add User
                </Link>
            </div>

            {/* Desktop View */}
            <div className="hidden md:block bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-slate-700/50 text-gray-600 dark:text-gray-300 text-sm uppercase tracking-wider">
                                <th className="p-4 font-semibold">User</th>
                                <th className="p-4 font-semibold">Email</th>
                                <th className="p-4 font-semibold">Role (Click to Change)</th>
                                <th className="p-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            {users.map((user) => (
                                <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                                    <td className="p-4 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="font-medium text-slate-900 dark:text-white">{user.name}</span>
                                    </td>
                                    <td className="p-4 text-gray-600 dark:text-gray-400">{user.email}</td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => toggleAdminHandler(user)}
                                            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold transition-all ${user.role === 'admin'
                                                ? 'text-purple-600 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/30 dark:hover:bg-purple-900/50'
                                                : 'text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600'
                                                }`}
                                            title="Click to toggle Admin status"
                                        >
                                            {user.role === 'admin' ? (
                                                <>
                                                    <ShieldCheck className="h-3 w-3" /> Admin
                                                </>
                                            ) : (
                                                <>
                                                    <User className="h-3 w-3" /> User
                                                </>
                                            )}
                                        </button>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => deleteHandler(user._id)}
                                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        // Optional: Disable deleting OTHER admins if needed, but usually SuperAdmin can delete Admins
                                        // For now, I'll remove the strict disable for admins so you can delete other admins if you have permission
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-4">
                {users.map((user) => (
                    <div key={user._id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white">{user.name}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-slate-700">
                            <button
                                onClick={() => toggleAdminHandler(user)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${user.role === 'admin'
                                    ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                    : 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-300'
                                    }`}
                            >
                                {user.role === 'admin' ? <ShieldCheck className="h-4 w-4" /> : <User className="h-4 w-4" />}
                                {user.role === 'admin' ? 'Admin' : 'Make Admin'}
                            </button>

                            <button
                                onClick={() => deleteHandler(user._id)}
                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            >
                                <Trash2 className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserListScreen;
