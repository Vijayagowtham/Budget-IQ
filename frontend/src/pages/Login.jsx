/**
 * BudgetIQ – Login Page
 * Handles email verification callback via URL query params
 */
import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Mail, Lock, LogIn } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import Logo from '../components/Logo';
import api from '../utils/api';

export default function Login() {
    const { login, isAuthenticated } = useAuth();
    const { success: toastSuccess, error: toastError } = useToast();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) navigate('/dashboard');
    }, [isAuthenticated, navigate]);

    // Handle email verification redirect query params
    useEffect(() => {
        const verified = searchParams.get('verified');
        const message = searchParams.get('message');
        if (verified === 'success') {
            toastSuccess(message || 'Email verified successfully! You can now sign in.');
        } else if (verified === 'already') {
            toastSuccess(message || 'Email already verified. You can sign in.');
        } else if (verified === 'error') {
            toastError(message || 'Email verification failed. Please try again.');
        }
    }, [searchParams, toastSuccess, toastError]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/api/auth/login', form);
            login(res.data.access_token, res.data.user);
            navigate('/dashboard');
        } catch (err) {
            toastError(err.response?.data?.detail || 'Login failed. Please try again.');
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
                <h2>Sign In</h2>

                <form onSubmit={handleSubmit} autoComplete="off">
                    <div className="form-group">
                        <label><Mail size={14} style={{ marginRight: 4, verticalAlign: '-2px' }} /> Email</label>
                        <input
                            type="email"
                            className="form-input"
                            placeholder="Enter your email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label><Lock size={14} style={{ marginRight: 4, verticalAlign: '-2px' }} /> Password</label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="Enter your password"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            required
                            autoComplete="new-password"
                        />
                    </div>
                    <div style={{ textAlign: 'right', marginBottom: 16 }}>
                        <Link to="/forgot-password" className="link-btn">Forgot Password?</Link>
                    </div>
                    <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                        {loading ? 'Signing in...' : <><LogIn size={18} /> Sign In</>}
                    </button>
                </form>

                <div className="auth-links">
                    Don't have an account? <Link to="/signup">Sign Up</Link>
                </div>
            </div>
        </div>
    );
}
