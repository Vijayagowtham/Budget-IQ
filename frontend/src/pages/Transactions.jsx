/**
 * BudgetIQ – Transactions Page (Professional Icons, No Emojis)
 */
import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Wallet, Plus, List, Trash2 } from 'lucide-react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import Skeleton from '../components/Skeleton';

export default function Transactions() {
    const [incomes, setIncomes] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [activeTab, setActiveTab] = useState('income');
    const [loading, setLoading] = useState(true);
    const [incomeForm, setIncomeForm] = useState({ amount: '', source: '', category: '', date: '' });
    const [expenseForm, setExpenseForm] = useState({ amount: '', category: '', description: '', date: '' });
    const { success, error } = useToast();
    const expenseCategories = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Health', 'Education', 'Rent', 'Other'];
    const incomeCategories = ['Salary', 'Freelance', 'Investments', 'Business', 'Gifts', 'Other'];

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [incRes, expRes] = await Promise.all([api.get('/api/income'), api.get('/api/expenses')]);
            setIncomes(incRes.data);
            setExpenses(expRes.data);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
    const balance = totalIncome - totalExpense;
    const formatCurrency = (val) => `₹${val.toLocaleString('en-IN')}`;

    const addIncome = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/api/income', { amount: parseFloat(incomeForm.amount), source: incomeForm.source, category: incomeForm.category, date: new Date(incomeForm.date).toISOString() });
            setIncomes([res.data, ...incomes]);
            setIncomeForm({ amount: '', source: '', category: '', date: '' });
            success('Income added successfully!');
        } catch (err) { error(err.response?.data?.detail || 'Failed to add income'); }
    };

    const addExpense = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/api/expenses', { amount: parseFloat(expenseForm.amount), category: expenseForm.category, description: expenseForm.description, date: new Date(expenseForm.date).toISOString() });
            setExpenses([res.data, ...expenses]);
            setExpenseForm({ amount: '', category: '', description: '', date: '' });
            success('Expense added successfully!');
        } catch (err) { error(err.response?.data?.detail || 'Failed to add expense'); }
    };

    const deleteIncome = async (id) => {
        try { await api.delete(`/api/income/${id}`); setIncomes(incomes.filter((i) => i.id !== id)); success('Income deleted'); }
        catch (err) { error('Failed to delete'); }
    };

    const deleteExpense = async (id) => {
        try { await api.delete(`/api/expenses/${id}`); setExpenses(expenses.filter((e) => e.id !== id)); success('Expense deleted'); }
        catch (err) { error('Failed to delete'); }
    };

    const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    if (loading) {
        return (
            <div className="page-container">
                <div className="summary-cards">
                    <Skeleton height="100px" />
                    <Skeleton height="100px" />
                    <Skeleton height="100px" />
                </div>
                <Skeleton height="40px" width="200px" style={{ marginBottom: 24 }} />
                <Skeleton height="300px" />
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="summary-cards">
                <div className="summary-card income">
                    <div className="summary-icon"><TrendingUp size={24} style={{ color: 'var(--accent-green)' }} /></div>
                    <div className="summary-info"><h3>Total Income</h3><div className="amount" style={{ color: 'var(--accent-green)' }}>{formatCurrency(totalIncome)}</div></div>
                </div>
                <div className="summary-card expense">
                    <div className="summary-icon"><TrendingDown size={24} style={{ color: 'var(--accent-red)' }} /></div>
                    <div className="summary-info"><h3>Total Expenses</h3><div className="amount" style={{ color: 'var(--accent-red)' }}>{formatCurrency(totalExpense)}</div></div>
                </div>
                <div className="summary-card balance">
                    <div className="summary-icon"><Wallet size={24} style={{ color: 'var(--primary)' }} /></div>
                    <div className="summary-info"><h3>Balance</h3><div className="amount" style={{ color: balance >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>{formatCurrency(balance)}</div></div>
                </div>
            </div>

            <div className="tabs">
                <button className={`tab-btn ${activeTab === 'income' ? 'active' : ''}`} onClick={() => setActiveTab('income')}>
                    <TrendingUp size={16} style={{ marginRight: 6, verticalAlign: '-2px' }} /> Income
                </button>
                <button className={`tab-btn ${activeTab === 'expense' ? 'active' : ''}`} onClick={() => setActiveTab('expense')}>
                    <TrendingDown size={16} style={{ marginRight: 6, verticalAlign: '-2px' }} /> Expenses
                </button>
            </div>

            {activeTab === 'income' && (
                <>
                    <div className="add-form">
                        <h3><Plus size={18} style={{ verticalAlign: '-3px' }} /> Add Income</h3>
                        <form onSubmit={addIncome}>
                            <div className="form-row">
                                <div className="form-group"><label>Amount</label><input type="number" className="form-input" placeholder="Enter amount" value={incomeForm.amount} onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })} required min="0.01" step="0.01" /></div>
                                <div className="form-group"><label>Source</label><input type="text" className="form-input" placeholder="e.g., Company Name" value={incomeForm.source} onChange={(e) => setIncomeForm({ ...incomeForm, source: e.target.value })} required /></div>
                                <div className="form-group"><label>Category</label><select className="form-select" value={incomeForm.category} onChange={(e) => setIncomeForm({ ...incomeForm, category: e.target.value })} required><option value="">Select category</option>{incomeCategories.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
                                <div className="form-group"><label>Date</label><input type="date" className="form-input" value={incomeForm.date} onChange={(e) => setIncomeForm({ ...incomeForm, date: e.target.value })} required /></div>
                            </div>
                            <div className="form-actions"><button type="submit" className="btn btn-success"><Plus size={16} /> Add Income</button></div>
                        </form>
                    </div>
                    <div className="transactions-section">
                        <h2><List size={20} style={{ verticalAlign: '-3px' }} /> Income History</h2>
                        {incomes.length === 0 ? (
                            <div className="empty-state"><TrendingUp size={36} style={{ opacity: 0.3 }} /><p>No income entries yet</p></div>
                        ) : (
                            <div className="table-wrapper"><table className="data-table"><thead><tr><th>Date</th><th>Category</th><th>Source</th><th>Amount</th><th></th></tr></thead><tbody>
                                {incomes.map((i) => (
                                    <tr key={i.id}><td>{formatDate(i.date)}</td><td>{i.category}</td><td>{i.source}</td><td className="amount-positive">{formatCurrency(i.amount)}</td>
                                        <td><button className="delete-btn" onClick={() => deleteIncome(i.id)}><Trash2 size={16} /></button></td></tr>
                                ))}
                            </tbody></table></div>
                        )}
                    </div>
                </>
            )}

            {activeTab === 'expense' && (
                <>
                    <div className="add-form">
                        <h3><Plus size={18} style={{ verticalAlign: '-3px' }} /> Add Expense</h3>
                        <form onSubmit={addExpense}>
                            <div className="form-row">
                                <div className="form-group"><label>Amount</label><input type="number" className="form-input" placeholder="Enter amount" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} required min="0.01" step="0.01" /></div>
                                <div className="form-group"><label>Category</label><select className="form-select" value={expenseForm.category} onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })} required><option value="">Select category</option>{expenseCategories.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
                                <div className="form-group"><label>Date</label><input type="date" className="form-input" value={expenseForm.date} onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })} required /></div>
                            </div>
                            <div className="form-group"><label>Description (Optional)</label><input type="text" className="form-input" placeholder="e.g., Lunch at restaurant" value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} /></div>
                            <div className="form-actions"><button type="submit" className="btn btn-danger"><Plus size={16} /> Add Expense</button></div>
                        </form>
                    </div>
                    <div className="transactions-section">
                        <h2><List size={20} style={{ verticalAlign: '-3px' }} /> Expense History</h2>
                        {expenses.length === 0 ? (
                            <div className="empty-state"><TrendingDown size={36} style={{ opacity: 0.3 }} /><p>No expenses recorded yet</p></div>
                        ) : (
                            <div className="table-wrapper"><table className="data-table"><thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Amount</th><th></th></tr></thead><tbody>
                                {expenses.map((e) => (
                                    <tr key={e.id}><td>{formatDate(e.date)}</td><td>{e.category}</td><td>{e.description || '—'}</td><td className="amount-negative">{formatCurrency(e.amount)}</td>
                                        <td><button className="delete-btn" onClick={() => deleteExpense(e.id)}><Trash2 size={16} /></button></td></tr>
                                ))}
                            </tbody></table></div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
