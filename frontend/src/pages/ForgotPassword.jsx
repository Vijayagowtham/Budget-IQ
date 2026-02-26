/**
 * BudgetIQ – Forgot Password Page (Professional Icons, No Emojis)
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, KeyRound, AlertCircle, CheckCircle } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import Logo from '../components/Logo';
import api from '../utils/api';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);
        try {
            const res = await api.post('/api/auth/forgot-password', { email });
            setMessage(res.data.message);
        } catch (err) {
            setError(err.response?.data?.detail || 'Something went wrong');
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
                <h2>Reset Password</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: '0.9rem' }}>
                    Enter your email address and we'll send you a reset link.
                </p>

                {error && <div className="alert alert-error"><AlertCircle size={16} /> {error}</div>}
                {message && <div className="alert alert-success"><CheckCircle size={16} /> {message}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label><Mail size={14} style={{ marginRight: 4, verticalAlign: '-2px' }} /> Email</label>
                        <input type="email" className="form-input" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                        {loading ? 'Sending...' : <><KeyRound size={18} /> Send Reset Link</>}
                    </button>
                </form>

                <div className="auth-links">
                    Remember your password? <Link to="/login">Sign In</Link>
                </div>
            </div>
        </div>
    );
}
