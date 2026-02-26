/**
 * BudgetIQ – Profile Page (Professional Icons, No Emojis)
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Save, LogOut, Camera, AlertCircle, CheckCircle } from 'lucide-react';
import api, { UPLOADS_URL } from '../utils/api';

export default function Profile() {
    const { user, updateUser, logout } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleSave = async (e) => {
        e.preventDefault(); setError(''); setSuccess(''); setSaving(true);
        try {
            const res = await api.put('/api/profile', form);
            updateUser(res.data);
            setSuccess('Profile updated successfully!');
        } catch (err) { setError(err.response?.data?.detail || 'Failed to update profile'); }
        setSaving(false);
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        setUploading(true); setError(''); setSuccess('');
        try {
            const res = await api.post('/api/profile/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            updateUser(res.data);
            setSuccess('Avatar updated successfully!');
        } catch (err) { setError(err.response?.data?.detail || 'Failed to upload avatar'); }
        setUploading(false);
    };

    const handleLogout = () => { logout(); navigate('/login'); };

    const getInitials = () => {
        if (!user?.name) return 'U';
        return user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div className="page-container">
            <div className="profile-card card">
                <div className="profile-avatar-section">
                    <div className="profile-avatar-large">
                        {user?.avatar_path ? <img src={`${UPLOADS_URL}/${user.avatar_path}`} alt="avatar" /> : getInitials()}
                    </div>
                    <div>
                        <label className="avatar-upload-btn" htmlFor="avatar-input">
                            <Camera size={16} /> {uploading ? 'Uploading...' : 'Change Photo'}
                        </label>
                        <input type="file" id="avatar-input" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
                    </div>
                </div>

                {error && <div className="alert alert-error"><AlertCircle size={16} /> {error}</div>}
                {success && <div className="alert alert-success"><CheckCircle size={16} /> {success}</div>}

                <form onSubmit={handleSave}>
                    <div className="form-group"><label>Full Name</label><input type="text" className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
                    <div className="form-group"><label>Email Address</label><input type="email" className="form-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
                    <div className="form-group">
                        <label>Member Since</label>
                        <input type="text" className="form-input" value={user?.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : ''} disabled />
                    </div>
                    <div className="form-actions" style={{ justifyContent: 'space-between' }}>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button type="button" className="btn btn-danger" onClick={handleLogout}>
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
