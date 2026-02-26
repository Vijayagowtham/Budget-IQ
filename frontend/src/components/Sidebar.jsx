/**
 * BudgetIQ – Sidebar Navigation (No Emojis – Lucide Icons)
 */
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, FileText, User } from 'lucide-react';
import Logo from './Logo';

export default function Sidebar() {
    const navItems = [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
        { path: '/reports', icon: FileText, label: 'Reports' },
        { path: '/profile', icon: User, label: 'Profile' },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <Logo size={36} />
            </div>
            <nav className="sidebar-nav">
                <div className="sidebar-section-label">Main Menu</div>
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                    >
                        <item.icon size={20} className="nav-icon" />
                        {item.label}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}
