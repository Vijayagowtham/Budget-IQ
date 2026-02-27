import React from 'react';

/**
 * BudgetIQ - Skeleton Loader Component
 * Modern loading state that prevents layout shifts.
 */
export default function Skeleton({ width, height, borderRadius = 'var(--radius-md)', style, className = '' }) {
    return (
        <div
            className={`skeleton ${className}`}
            style={{
                width: width || '100%',
                height: height || '20px',
                borderRadius,
                ...style
            }}
        />
    );
}
