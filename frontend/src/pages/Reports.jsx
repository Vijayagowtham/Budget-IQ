/**
 * BudgetIQ – Reports Page (Professional Icons, No Emojis)
 */
import { useState } from 'react';
import { FileText, Download, BarChart3, Calendar } from 'lucide-react';
import api from '../utils/api';

export default function Reports() {
    const [downloading, setDownloading] = useState('');

    const downloadReport = async (format, period) => {
        const key = `${format}-${period}`;
        setDownloading(key);
        try {
            const res = await api.get(`/api/reports/${format}?period=${period}`, { responseType: 'blob' });
            const ext = format === 'pdf' ? 'pdf' : 'xlsx';
            const fileName = `BudgetIQ_${period}_report.${ext}`;
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) { alert('Failed to download report. Please try again.'); }
        setDownloading('');
    };

    return (
        <div className="page-container">
            <h1 className="section-title"><FileText size={24} /> Export Reports</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>
                Download your financial reports in PDF or Excel format for weekly or monthly periods.
            </p>

            <div className="report-options">
                <div className="report-card">
                    <div className="report-icon"><Calendar size={48} style={{ color: 'var(--primary)' }} /></div>
                    <h3>Weekly Report</h3>
                    <p>Last 7 days income, expenses, and balance summary</p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                        <button className="btn btn-primary btn-sm" onClick={() => downloadReport('pdf', 'weekly')} disabled={!!downloading}>
                            {downloading === 'pdf-weekly' ? 'Downloading...' : <><Download size={14} /> PDF</>}
                        </button>
                        <button className="btn btn-success btn-sm" onClick={() => downloadReport('excel', 'weekly')} disabled={!!downloading}>
                            {downloading === 'excel-weekly' ? 'Downloading...' : <><Download size={14} /> Excel</>}
                        </button>
                    </div>
                </div>

                <div className="report-card">
                    <div className="report-icon"><BarChart3 size={48} style={{ color: 'var(--accent-green)' }} /></div>
                    <h3>Monthly Report</h3>
                    <p>Current month income, expenses, and balance summary</p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                        <button className="btn btn-primary btn-sm" onClick={() => downloadReport('pdf', 'monthly')} disabled={!!downloading}>
                            {downloading === 'pdf-monthly' ? 'Downloading...' : <><Download size={14} /> PDF</>}
                        </button>
                        <button className="btn btn-success btn-sm" onClick={() => downloadReport('excel', 'monthly')} disabled={!!downloading}>
                            {downloading === 'excel-monthly' ? 'Downloading...' : <><Download size={14} /> Excel</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
