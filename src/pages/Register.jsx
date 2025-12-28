import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader } from 'lucide-react';

const FloatingInput = ({ label, type, value, onChange, error }) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = value.length > 0;

    return (
        <div className="relative mb-6">
            <input
                type={type}
                value={value}
                onChange={onChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className={`
                    w-full px-4 py-3.5 bg-gray-50 dark:bg-slate-900 border rounded-xl outline-none transition-all dark:text-white
                    ${error ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900'}
                    ${hasValue || isFocused ? 'pt-6 pb-2' : ''}
                `}
            />
            <label
                className={`
                    absolute left-4 transition-all duration-200 pointer-events-none text-gray-500 dark:text-gray-400
                    ${hasValue || isFocused
                        ? 'top-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400'
                        : 'top-3.5 text-base'}
                `}
            >
                {label}
            </label>
        </div>
    );
};

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e, field) => {
        setFormData({ ...formData, [field]: e.target.value });
    };

    const calculateStrength = (pass) => {
        let strength = 0;
        if (pass.length > 7) strength += 25;
        if (pass.match(/[A-Z]/)) strength += 25;
        if (pass.match(/[0-9]/)) strength += 25;
        if (pass.match(/[^A-Za-z0-9]/)) strength += 25;
        return strength;
    };

    const strength = calculateStrength(formData.password);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setError('');
        setLoading(true);
        try {
            await register(formData.name, formData.email, formData.password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 relative overflow-hidden py-12 transition-colors duration-300">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-200/20 dark:bg-indigo-900/20 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-200/20 dark:bg-purple-900/20 rounded-full blur-[80px] -translate-x-1/2 translate-y-1/2"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-800 p-8 md:p-10 rounded-3xl shadow-xl w-full max-w-md relative z-10 border border-gray-100 dark:border-slate-700"
            >
                <Link to="/login" className="inline-flex items-center gap-2 text-gray-400 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors font-medium">
                    <ArrowLeft className="h-4 w-4" /> Back to Login
                </Link>

                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Create Account</h2>
                    <p className="text-gray-500 dark:text-gray-400">Join Berlina Fashion Design and start shopping today</p>
                </div>

                {error && <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg text-sm border border-red-200 dark:border-red-800">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <FloatingInput
                        label="Full Name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange(e, 'name')}
                    />
                    <FloatingInput
                        label="Email Address"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange(e, 'email')}
                    />
                    <FloatingInput
                        label="Password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleChange(e, 'password')}
                    />

                    {/* Password Strength Indicator */}
                    {formData.password && (
                        <div className="mb-4 -mt-4">
                            <div className="flex gap-1 h-1 mb-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div className={`flex-1 ${strength >= 25 ? 'bg-red-500' : 'bg-transparent'}`}></div>
                                <div className={`flex-1 ${strength >= 50 ? 'bg-yellow-500' : 'bg-transparent'}`}></div>
                                <div className={`flex-1 ${strength >= 75 ? 'bg-blue-500' : 'bg-transparent'}`}></div>
                                <div className={`flex-1 ${strength >= 100 ? 'bg-green-500' : 'bg-transparent'}`}></div>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 text-right">
                                {strength < 50 ? "Weak" : strength < 100 ? "Medium" : "Strong"} password
                            </p>
                        </div>
                    )}

                    <FloatingInput
                        label="Confirm Password"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleChange(e, 'confirmPassword')}
                    />

                    <button disabled={loading} className="w-full py-4 bg-slate-900 dark:bg-indigo-600 text-white rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70">
                        {loading ? <Loader className="animate-spin h-5 w-5" /> : 'Create Account'}
                    </button>
                </form>

                <p className="mt-8 text-center text-xs text-gray-400">
                    By joining, you agree to our Terms of Service and Privacy Policy
                </p>
            </motion.div>
        </div>
    );
};

export default Register;
