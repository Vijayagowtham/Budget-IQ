"""
BudgetIQ – Rate Limiter Configuration
Standalone module to avoid circular imports between main.py and routes.
"""
try:
    from slowapi import Limiter
    from slowapi.util import get_remote_address
    limiter = Limiter(key_func=get_remote_address)
    HAS_SLOWAPI = True
except ImportError:
    limiter = None
    HAS_SLOWAPI = False
