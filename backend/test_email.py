import os
import sys
from dotenv import load_dotenv

# Load .env
load_dotenv()

from email_utils import _send_via_resend, _send_via_smtp

print("Testing Resend:")
resend_success = _send_via_resend("vijayagowthamv@gmail.com", "Test Resend", "<b>Test</b>")
print(f"Resend success: {resend_success}")

print("\nTesting SMTP:")
smtp_success = _send_via_smtp("vijayagowthamv@gmail.com", "Test SMTP", "<b>Test</b>")
print(f"SMTP success: {smtp_success}")
