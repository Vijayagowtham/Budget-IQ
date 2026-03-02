/**
 * BudgetIQ – Signup Page (Professional Icons, No Emojis)
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { UserPlus, Mail, Lock, User } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import Logo from '../components/Logo';
import api from '../utils/api';

export default function Signup() {
    const { success: toastSuccess, error: toastError } = useToast();
    const { logout } = useAuth();
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);

    // Clear any existing session when landing on signup
    useEffect(() => {
        logout();
    }, [logout]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (form.password !== form.confirmPassword) {
            toastError('Passwords do not match');
            return;
        }
        if (form.password.length < 6) {
            toastError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/api/auth/signup', {
                name: form.name,
                email: form.email,
                password: form.password,
            });
            toastSuccess(res.data.message || 'Account created successfully! Please check your email to verify.');
            setForm({ name: '', email: '', password: '', confirmPassword: '' });
            // Redirect to login page with a query param instruction
            // Use window.location or navigate if available
            window.location.href = '/login?verified=pending&message=Account+created!+Please+verify+your+email+before+logging+in.';
        } catch (err) {
            const detail = err.response?.data?.detail;
            if (detail) {
                toastError(detail);
            } else if (err.request && !err.response) {
                toastError('Cannot connect to server. Please check if the backend is running.');
            } else {
                toastError('Signup failed. Please try again.');
            }
        }
        setLoading(false);
    };

    return (
        <div className="auth-page">
            <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
                <ThemeToggle />
            </div>
            <div className="auth-card">
                <div className="auth-logo">
                    <Logo size={44} />
                    <p>Smart Budget Management</p>
                </div>
                <h2>Create Account</h2>

                <form onSubmit={handleSubmit} autoComplete="off">
                    <div className="form-group">
                        <label><User size={14} style={{ marginRight: 4, verticalAlign: '-2px' }} /> Full Name</label>
                        <input type="text" className="form-input" placeholder="Enter your full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label><Mail size={14} style={{ marginRight: 4, verticalAlign: '-2px' }} /> Email</label>
                        <input type="email" className="form-input" placeholder="Enter your email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label><Lock size={14} style={{ marginRight: 4, verticalAlign: '-2px' }} /> Password</label>
                        <input type="password" className="form-input" placeholder="Create a password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} autoComplete="new-password" />
                    </div>
                    <div className="form-group">
                        <label><Lock size={14} style={{ marginRight: 4, verticalAlign: '-2px' }} /> Confirm Password</label>
                        <input type="password" className="form-input" placeholder="Confirm your password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required autoComplete="new-password" />
                    </div>
                    <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                        {loading ? 'Creating Account...' : <><UserPlus size={18} /> Sign Up</>}
                    </button>
                </form>

                <div className="auth-links">
                    Already have an account? <Link to="/login">Sign In</Link>
                </div>
            </div>
        </div>
    );
}
