/**
 * BudgetIQ – Reset Password Page
 * Handles the password reset via token sent to email
 */
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { Lock, Save } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import Logo from '../components/Logo';
import api from '../utils/api';

export default function ResetPassword() {
    const { success, error } = useToast();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [form, setForm] = useState({ new_password: '', confirm_password: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!token) {
            error('Invalid or missing reset token.');
            return;
        }

        if (form.new_password !== form.confirm_password) {
            error('Passwords do not match.');
            return;
        }

        if (form.new_password.length < 6) {
            error('Password must be at least 6 characters long.');
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/api/auth/reset-password', {
                token: token,
                new_password: form.new_password
            });
            success(res.data.message || 'Password successfully reset.');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            error(err.response?.data?.detail || 'Failed to reset password. The link may have expired.');
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
                    <p>Secure Account Access</p>
                </div>
                <h2>Reset Your Password</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.9rem' }}>
                    Enter your new password below.
                </p>

                <form onSubmit={handleSubmit} autoComplete="off">
                    <div className="form-group">
                        <label><Lock size={14} style={{ marginRight: 4, verticalAlign: '-2px' }} /> New Password</label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="Enter new password"
                            value={form.new_password}
                            onChange={(e) => setForm({ ...form, new_password: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label><Lock size={14} style={{ marginRight: 4, verticalAlign: '-2px' }} /> Confirm Password</label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="Confirm new password"
                            value={form.confirm_password}
                            onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-full" disabled={loading || !token}>
                        {loading ? 'Saving...' : <><Save size={18} /> Reset Password</>}
                    </button>
                    {!token && (
                        <p style={{ color: 'var(--accent-red)', fontSize: '0.85rem', marginTop: 12, textAlign: 'center' }}>
                            Missing reset token in URL. Please use the link from your email.
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
}
