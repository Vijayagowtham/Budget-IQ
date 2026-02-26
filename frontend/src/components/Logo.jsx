/**
 * BudgetIQ – Professional SVG Logo Component
 * Minimal, finance-themed logo with abstract chart + "IQ" spark
 */
export default function Logo({ size = 40, showText = true, className = '' }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }} className={className}>
            <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Background rounded square */}
                <rect width="48" height="48" rx="12" fill="url(#logo-gradient)" />
                {/* Abstract rising chart bars */}
                <rect x="10" y="30" width="5" height="8" rx="1.5" fill="rgba(255,255,255,0.5)" />
                <rect x="18" y="24" width="5" height="14" rx="1.5" fill="rgba(255,255,255,0.7)" />
                <rect x="26" y="18" width="5" height="20" rx="1.5" fill="rgba(255,255,255,0.85)" />
                <rect x="34" y="12" width="5" height="26" rx="1.5" fill="white" />
                {/* Upward trend line */}
                <path d="M12 28 L20 22 L28 16 L36 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.9" />
                {/* Arrow tip */}
                <path d="M33 9 L37 9 L37 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.9" />
                <defs>
                    <linearGradient id="logo-gradient" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#6C63FF" />
                        <stop offset="1" stopColor="#4ECDC4" />
                    </linearGradient>
                </defs>
            </svg>
            {showText && (
                <span style={{
                    fontSize: size * 0.55,
                    fontWeight: 800,
                    letterSpacing: '-0.5px',
                    background: 'linear-gradient(135deg, #6C63FF, #4ECDC4)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                }}>
                    BudgetIQ
                </span>
            )}
        </div>
    );
}
