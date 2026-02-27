import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("BudgetIQ App Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary animate-fade-in">
                    <AlertTriangle size={64} style={{ color: 'var(--accent-red)', marginBottom: '24px' }} />
                    <h1>Something went wrong</h1>
                    <p>We encountered an unexpected error while rendering this page. The issue has been logged.</p>
                    <button
                        className="btn btn-primary"
                        onClick={() => window.location.reload()}
                    >
                        <RefreshCw size={18} /> Reload Application
                    </button>
                    {process.env.NODE_ENV === 'development' && (
                        <pre style={{ marginTop: '24px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px', textAlign: 'left', overflow: 'auto', maxWidth: '800px', fontSize: '12px' }}>
                            {this.state.error?.toString()}
                        </pre>
                    )}
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
