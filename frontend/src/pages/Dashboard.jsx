/**
 * BudgetIQ – Dashboard Page (Pie Chart + Summary Cards)
 */
import { useState, useEffect } from 'react';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, TrendingDown, Wallet, PieChart as PieChartIcon, Brain } from 'lucide-react';
import api from '../utils/api';
import AiPanel from '../components/AiPanel';
import Skeleton from '../components/Skeleton';

const PIE_COLORS = ['#00C896', '#FF5252'];

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent === 0) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
        <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central"
            style={{ fontSize: '14px', fontWeight: 700, textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>
            {`${(percent * 100).toFixed(1)}%`}
        </text>
    );
};

export default function Dashboard() {
    const [summary, setSummary] = useState({ total_income: 0, total_expense: 0, current_balance: 0 });
    const [aiOpen, setAiOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/dashboard/summary');
            setSummary(res.data);
        } catch (err) { console.error('Dashboard fetch error:', err); }
        setLoading(false);
    };

    const formatCurrency = (val) => `₹${val.toLocaleString('en-IN')}`;

    const pieData = [
        { name: 'Income', value: summary.total_income },
        { name: 'Expenses', value: summary.total_expense },
    ];

    const hasData = summary.total_income > 0 || summary.total_expense > 0;

    return (
        <div className="page-container">
            <div className="summary-cards">
                <div className="summary-card income">
                    <div className="summary-icon"><TrendingUp size={24} style={{ color: 'var(--accent-green)' }} /></div>
                    <div className="summary-info">
                        <h3>Total Income</h3>
                        {loading ? <Skeleton height="32px" width="100px" style={{ marginTop: 4 }} /> : <div className="amount" style={{ color: 'var(--accent-green)' }}>{formatCurrency(summary.total_income)}</div>}
                    </div>
                </div>
                <div className="summary-card expense">
                    <div className="summary-icon"><TrendingDown size={24} style={{ color: 'var(--accent-red)' }} /></div>
                    <div className="summary-info">
                        <h3>Total Expenses</h3>
                        {loading ? <Skeleton height="32px" width="100px" style={{ marginTop: 4 }} /> : <div className="amount" style={{ color: 'var(--accent-red)' }}>{formatCurrency(summary.total_expense)}</div>}
                    </div>
                </div>
                <div className="summary-card balance">
                    <div className="summary-icon"><Wallet size={24} style={{ color: 'var(--primary)' }} /></div>
                    <div className="summary-info">
                        <h3>Current Balance</h3>
                        {loading ? (
                            <Skeleton height="32px" width="100px" style={{ marginTop: 4 }} />
                        ) : (
                            <div className="amount" style={{ color: summary.current_balance >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                                {formatCurrency(summary.current_balance)}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="chart-container">
                <div className="chart-header">
                    <h2><PieChartIcon size={20} style={{ marginRight: 8, verticalAlign: '-3px' }} /> Income vs Expenses</h2>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 360 }}>
                        <Skeleton height="300px" width="300px" borderRadius="var(--radius-full)" />
                    </div>
                ) : !hasData ? (
                    <div className="empty-state">
                        <PieChartIcon size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
                        <p>No data to display. Start adding income and expenses!</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={360}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={140}
                                paddingAngle={3}
                                dataKey="value"
                                labelLine={false}
                                label={renderCustomLabel}
                                animationBegin={0}
                                animationDuration={800}
                                animationEasing="ease-out"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={PIE_COLORS[index]}
                                        stroke="none"
                                        style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.15))' }}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value, name) => [formatCurrency(value), name]}
                                contentStyle={{
                                    background: 'var(--bg-secondary)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                    fontSize: '13px'
                                }}
                            />
                            <Legend
                                verticalAlign="bottom"
                                iconType="circle"
                                iconSize={10}
                                wrapperStyle={{ fontSize: '13px', paddingTop: '16px' }}
                            />
                        </PieChart>
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
