/**
 * BudgetIQ – Dashboard Page (Professional Icons, No Emojis)
 */
import { useState, useEffect } from 'react';
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, TrendingDown, Wallet, BarChart3, Brain } from 'lucide-react';
import api from '../utils/api';
import AiPanel from '../components/AiPanel';

export default function Dashboard() {
    const [summary, setSummary] = useState({ total_income: 0, total_expense: 0, current_balance: 0 });
    const [chartData, setChartData] = useState([]);
    const [period, setPeriod] = useState('monthly');
    const [chartType, setChartType] = useState('bar');
    const [aiOpen, setAiOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchData(); }, [period]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [sumRes, chartRes] = await Promise.all([
                api.get('/api/dashboard/summary'),
                api.get(`/api/dashboard/chart-data?period=${period}`),
            ]);
            setSummary(sumRes.data);
            setChartData(chartRes.data);
        } catch (err) { console.error('Dashboard fetch error:', err); }
        setLoading(false);
    };

    const formatCurrency = (val) => `₹${val.toLocaleString('en-IN')}`;

    return (
        <div className="page-container">
            <div className="summary-cards">
                <div className="summary-card income">
                    <div className="summary-icon"><TrendingUp size={24} style={{ color: 'var(--accent-green)' }} /></div>
                    <div className="summary-info">
                        <h3>Total Income</h3>
                        <div className="amount" style={{ color: 'var(--accent-green)' }}>{formatCurrency(summary.total_income)}</div>
                    </div>
                </div>
                <div className="summary-card expense">
                    <div className="summary-icon"><TrendingDown size={24} style={{ color: 'var(--accent-red)' }} /></div>
                    <div className="summary-info">
                        <h3>Total Expenses</h3>
                        <div className="amount" style={{ color: 'var(--accent-red)' }}>{formatCurrency(summary.total_expense)}</div>
                    </div>
                </div>
                <div className="summary-card balance">
                    <div className="summary-icon"><Wallet size={24} style={{ color: 'var(--primary)' }} /></div>
                    <div className="summary-info">
                        <h3>Current Balance</h3>
                        <div className="amount" style={{ color: summary.current_balance >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                            {formatCurrency(summary.current_balance)}
                        </div>
                    </div>
                </div>
            </div>

            <div className="chart-container">
                <div className="chart-header">
                    <h2><BarChart3 size={20} style={{ marginRight: 8, verticalAlign: '-3px' }} /> Income vs Expenses</h2>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <div className="chart-toggle">
                            <button className={chartType === 'bar' ? 'active' : ''} onClick={() => setChartType('bar')}>Bar</button>
                            <button className={chartType === 'line' ? 'active' : ''} onClick={() => setChartType('line')}>Line</button>
                        </div>
                        <div className="chart-toggle">
                            <button className={period === 'weekly' ? 'active' : ''} onClick={() => setPeriod('weekly')}>Weekly</button>
                            <button className={period === 'monthly' ? 'active' : ''} onClick={() => setPeriod('monthly')}>Monthly</button>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="spinner" />
                ) : chartData.length === 0 ? (
                    <div className="empty-state">
                        <BarChart3 size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
                        <p>No data to display. Start adding income and expenses!</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={320}>
                        {chartType === 'bar' ? (
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                                <Legend />
                                <Bar dataKey="income" fill="#00C896" name="Income" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="expense" fill="#FF5252" name="Expense" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        ) : (
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                                <Legend />
                                <Line type="monotone" dataKey="income" stroke="#00C896" name="Income" strokeWidth={3} dot={{ r: 5 }} />
                                <Line type="monotone" dataKey="expense" stroke="#FF5252" name="Expense" strokeWidth={3} dot={{ r: 5 }} />
                            </LineChart>
                        )}
                    </ResponsiveContainer>
                )}
            </div>

            <button className="btn btn-primary" onClick={() => setAiOpen(true)} style={{ position: 'fixed', bottom: 24, right: 24, borderRadius: 'var(--radius-full)', padding: '14px 24px', zIndex: 50 }}>
                <Brain size={20} /> AI Insights
            </button>
            <AiPanel isOpen={aiOpen} onClose={() => setAiOpen(false)} />
        </div>
    );
}
