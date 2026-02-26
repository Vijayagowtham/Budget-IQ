/**
 * BudgetIQ – Notification Bell (Lucide Icons, No Emojis)
 */
import { useState, useEffect, useRef } from 'react';
import { Bell, AlertTriangle, AlertCircle, Info, CheckCheck } from 'lucide-react';
import api from '../utils/api';

export default function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => { fetchNotifications(); }, []);

    useEffect(() => {
        const handleClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const fetchNotifications = async () => {
        try { const res = await api.get('/api/notifications'); setNotifications(res.data); } catch (err) { }
    };

    const markAllRead = async () => {
        try {
            await api.put('/api/notifications/read-all');
            setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        } catch (err) { }
    };

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    const getIcon = (type) => {
        switch (type) {
            case 'warning': return <AlertTriangle size={16} className="notif-icon" style={{ color: 'var(--accent-orange)' }} />;
            case 'alert': return <AlertCircle size={16} className="notif-icon" style={{ color: 'var(--accent-red)' }} />;
            default: return <Info size={16} className="notif-icon" style={{ color: 'var(--accent-blue)' }} />;
        }
    };

    const timeAgo = (dateStr) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button className="notif-btn" onClick={() => setOpen(!open)}>
                <Bell size={20} />
                {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
            </button>
            {open && (
                <div className="notif-dropdown">
                    <div className="notif-dropdown-header">
                        <h3>Notifications</h3>
                        {unreadCount > 0 && (
                            <button className="link-btn" onClick={markAllRead} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <CheckCheck size={14} /> Mark all read
                            </button>
                        )}
                    </div>
                    {notifications.length === 0 ? (
                        <div className="empty-state" style={{ padding: '24px' }}><p>No notifications yet</p></div>
                    ) : (
                        notifications.slice(0, 10).map((n) => (
                            <div key={n.id} className={`notif-item ${!n.is_read ? 'unread' : ''}`}>
                                {getIcon(n.type)}
                                <div>
                                    <div className="notif-text">{n.message}</div>
                                    <div className="notif-time">{timeAgo(n.created_at)}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
