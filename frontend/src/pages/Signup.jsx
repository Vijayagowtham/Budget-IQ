/**
 * BudgetIQ – Signup Page (Professional Icons, No Emojis)
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import Logo from '../components/Logo';
import api from '../utils/api';

export default function Signup() {
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (form.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/api/auth/signup', {
                name: form.name,
                email: form.email,
                password: form.password,
            });
            setSuccess(res.data.message);
            setForm({ name: '', email: '', password: '', confirmPassword: '' });
        } catch (err) {
            setError(err.response?.data?.detail || 'Signup failed. Please try again.');
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

                {error && (
                    <div className="alert alert-error">
                        <AlertCircle size={16} /> {error}
                    </div>
                )}
                {success && (
                    <div className="alert alert-success">
                        <CheckCircle size={16} /> {success}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
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
                        <input type="password" className="form-input" placeholder="Create a password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
                    </div>
                    <div className="form-group">
                        <label><Lock size={14} style={{ marginRight: 4, verticalAlign: '-2px' }} /> Confirm Password</label>
                        <input type="password" className="form-input" placeholder="Confirm your password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />
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
