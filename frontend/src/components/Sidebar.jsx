/**
 * BudgetIQ – Sidebar Navigation (Responsive with mobile overlay)
 */
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, FileText, User, X } from 'lucide-react';
import Logo from './Logo';

export default function Sidebar({ isOpen, onClose }) {
    const navItems = [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
        { path: '/reports', icon: FileText, label: 'Reports' },
        { path: '/profile', icon: User, label: 'Profile' },
    ];

    return (
        <>
            {/* Mobile overlay backdrop */}
            {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-logo">
                    <Logo size={36} />
                    <button className="sidebar-close-btn" onClick={onClose} aria-label="Close menu">
                        <X size={22} />
                    </button>
                </div>
                <nav className="sidebar-nav">
                    <div className="sidebar-section-label">Main Menu</div>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                            onClick={onClose}
                        >
                            <item.icon size={20} className="nav-icon" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
            </aside>
        </>
    );
}
