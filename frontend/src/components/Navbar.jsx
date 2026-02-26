/**
 * BudgetIQ – Navbar (Lucide Icons, No Emojis)
 */
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, LogOut } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import NotificationBell from './NotificationBell';
import { UPLOADS_URL } from '../utils/api';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClick = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getTitle = () => {
        const path = location.pathname;
        if (path.includes('dashboard')) return 'Dashboard';
        if (path.includes('transactions')) return 'Transactions';
        if (path.includes('reports')) return 'Reports';
        if (path.includes('profile')) return 'Profile';
        return 'BudgetIQ';
    };

    const getInitials = () => {
        if (!user?.name) return 'U';
        return user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <h1>{getTitle()}</h1>
            </div>
            <div className="navbar-right">
                <ThemeToggle />
                <NotificationBell />
                <div className="user-menu" ref={menuRef}>
                    <div className="navbar-avatar" onClick={() => setMenuOpen(!menuOpen)}>
                        {user?.avatar_path ? (
                            <img src={`${UPLOADS_URL}/${user.avatar_path}`} alt="avatar" />
                        ) : (
                            getInitials()
                        )}
                    </div>
                    {menuOpen && (
                        <div className="user-menu-dropdown">
                            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-light)' }}>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user?.name}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{user?.email}</div>
                            </div>
                            <Link to="/profile" className="user-menu-item" onClick={() => setMenuOpen(false)}>
                                <User size={16} /> Profile
                            </Link>
                            <div className="user-menu-divider" />
                            <button className="user-menu-item danger" onClick={handleLogout}>
                                <LogOut size={16} /> Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
