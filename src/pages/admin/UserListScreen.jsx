import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Trash2, Shield, User } from 'lucide-react';

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
            await api.delete(`/users/${id}`);
            setUsers(users.filter(user => user._id !== id));
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">User Management</h1>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-slate-700/50 text-gray-600 dark:text-gray-300 text-sm uppercase tracking-wider">
                                <th className="p-4 font-semibold">User</th>
                                <th className="p-4 font-semibold">Email</th>
                                <th className="p-4 font-semibold">Role</th>
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
                                        {user.role === 'admin' ? (
                                            <span className="flex items-center gap-1 text-purple-600 bg-purple-50 px-2 py-1 rounded-full text-xs font-bold w-fit">
                                                <Shield className="h-3 w-3" /> Admin
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-gray-600 bg-gray-100 px-2 py-1 rounded-full text-xs font-bold w-fit">
                                                <User className="h-3 w-3" /> User
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => deleteHandler(user._id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            disabled={user.role === 'admin'}
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
        </div>
    );
};

export default UserListScreen;
