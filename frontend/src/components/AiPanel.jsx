/**
 * BudgetIQ – AI Insights Panel (Lucide Icons, No Emojis)
 */
import { useState, useEffect, useRef } from 'react';
import { X, Brain, Send, Lightbulb, AlertTriangle, AlertCircle, Info, MessageSquare, Sparkles } from 'lucide-react';
import api from '../utils/api';

export default function AiPanel({ isOpen, onClose }) {
    const [insights, setInsights] = useState([]);
    const [messages, setMessages] = useState([
        { role: 'bot', text: 'Hi! I\'m your BudgetIQ AI assistant. Ask me anything about your finances!' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => { if (isOpen) fetchInsights(); }, [isOpen]);
    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const fetchInsights = async () => {
        try { const res = await api.get('/api/ai/insights'); setInsights(res.data); } catch (err) { }
    };

    const sendMessage = async () => {
        if (!input.trim() || loading) return;
        const userMsg = input.trim();
        setInput('');
        setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
        setLoading(true);
        try {
            const res = await api.post('/api/ai/chat', { message: userMsg });
            setMessages((prev) => [...prev, { role: 'bot', text: res.data.reply }]);
        } catch (err) {
            setMessages((prev) => [...prev, { role: 'bot', text: 'Sorry, something went wrong. Please try again.' }]);
        }
        setLoading(false);
    };

    const handleKeyDown = (e) => { if (e.key === 'Enter') sendMessage(); };

    const getInsightIcon = (type) => {
        switch (type) {
            case 'tip': return <Lightbulb size={18} style={{ color: 'var(--accent-green)', flexShrink: 0 }} />;
            case 'warning': return <AlertTriangle size={18} style={{ color: 'var(--accent-orange)', flexShrink: 0 }} />;
            case 'alert': return <AlertCircle size={18} style={{ color: 'var(--accent-red)', flexShrink: 0 }} />;
            default: return <Info size={18} style={{ color: 'var(--accent-blue)', flexShrink: 0 }} />;
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="ai-panel-overlay" onClick={onClose} />
            <div className="ai-panel">
                <div className="ai-panel-header">
                    <h2><Brain size={20} /> AI Insights</h2>
                    <button className="ai-panel-close" onClick={onClose}><X size={20} /></button>
                </div>
                <div className="ai-insights-list">
                    {insights.length === 0 ? (
                        <div className="empty-state" style={{ padding: '16px' }}>
                            <Sparkles size={24} style={{ opacity: 0.4, marginBottom: 8 }} />
                            <p>Add income & expenses to get AI insights!</p>
                        </div>
                    ) : (
                        insights.map((insight, i) => (
                            <div key={i} className={`ai-insight-card ${insight.type}`}>
                                {getInsightIcon(insight.type)}
                                <span className="ai-insight-text">{insight.message}</span>
                            </div>
                        ))
                    )}
                </div>
                <div className="ai-chat">
                    <div className="ai-chat-header"><MessageSquare size={14} style={{ marginRight: 6 }} /> Chat with AI</div>
                    <div className="ai-chat-messages">
                        {messages.map((msg, i) => (
                            <div key={i} className={`chat-msg ${msg.role}`}>{msg.text}</div>
                        ))}
                        {loading && <div className="chat-msg bot" style={{ opacity: 0.6 }}>Thinking...</div>}
                        <div ref={chatEndRef} />
                    </div>
                    <div className="ai-chat-input">
                        <input type="text" placeholder="Ask about your finances..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} />
                        <button onClick={sendMessage} disabled={loading}><Send size={18} /></button>
                    </div>
                </div>
            </div>
        </>
    );
}
