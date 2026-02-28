"""
BudgetIQ – Email Utility
Sends verification and password reset emails via Resend API.
Falls back to SMTP, then to console print if nothing is configured.
Uses background threading so email sending never blocks API responses.
"""
import logging
import smtplib
import threading
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import (
    RESEND_API_KEY, RESEND_FROM,
    SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM
)

logger = logging.getLogger(__name__)

# Check which email provider is configured
_RESEND_CONFIGURED = bool(RESEND_API_KEY)
_SMTP_CONFIGURED = bool(SMTP_HOST and SMTP_USER and SMTP_PASSWORD)

# SMTP connection timeout (seconds)
_SMTP_TIMEOUT = 10

if _RESEND_CONFIGURED:
    logger.info("Email provider: Resend API")
elif _SMTP_CONFIGURED:
    logger.info("Email provider: SMTP")
else:
    logger.warning("No email provider configured – verification links will print to console")


def _send_via_resend(to_email: str, subject: str, html_body: str) -> bool:
    """Send an email via Resend API. Returns True on success."""
    try:
        import resend
        resend.api_key = RESEND_API_KEY

        params = {
            "from": RESEND_FROM,
            "to": [to_email],
            "subject": subject,
            "html": html_body,
        }
        result = resend.Emails.send(params)
        logger.info(f"Email sent via Resend to {to_email}: {subject} (id: {result.get('id', 'N/A')})")
        return True
    except Exception as e:
        logger.error(f"Resend failed for {to_email}: {e}")
        return False


def _send_via_smtp(to_email: str, subject: str, html_body: str) -> bool:
    """Send an email via SMTP. Returns True on success."""
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = SMTP_FROM or SMTP_USER
        msg["To"] = to_email
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=_SMTP_TIMEOUT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(msg["From"], to_email, msg.as_string())

        logger.info(f"Email sent via SMTP to {to_email}: {subject}")
        return True
    except smtplib.SMTPAuthenticationError as e:
        logger.error(
            f"SMTP authentication failed: {e}. "
            "If using Gmail, you need an App Password – see https://myaccount.google.com/apppasswords"
        )
        return False
    except Exception as e:
        logger.error(f"SMTP failed for {to_email}: {e}")
        return False


def _send_email(to_email: str, subject: str, html_body: str) -> bool:
    """Send email using the best available provider. Returns True on success."""
    if _RESEND_CONFIGURED:
        return _send_via_resend(to_email, subject, html_body)
    elif _SMTP_CONFIGURED:
        return _send_via_smtp(to_email, subject, html_body)
    return False


def _send_email_async(to_email: str, subject: str, html_body: str, fallback_label: str, fallback_url: str) -> None:
    """Send email in a background thread. Falls back to console on failure."""
    def _worker():
        sent = _send_email(to_email, subject, html_body)
        if not sent:
            print(f"\n{'='*60}")
            print(f"[{fallback_label}] Link for {to_email}:")
            print(f"   {fallback_url}")
            print(f"{'='*60}\n")

    thread = threading.Thread(target=_worker, daemon=True)
    thread.start()


def send_verification_email(to_email: str, verify_url: str) -> None:
    """Send email verification link asynchronously."""
    html = f"""
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="font-size: 28px; font-weight: 800; margin: 0;">
                <span style="background: linear-gradient(135deg, #6C63FF, #00C896);
                -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                background-clip: text;">BudgetIQ</span>
            </h1>
            <p style="color: #6B7280; font-size: 14px; margin-top: 4px;">AI Budget Management</p>
        </div>
        <div style="background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 16px; padding: 32px;">
            <h2 style="font-size: 20px; font-weight: 700; margin: 0 0 12px;">Verify Your Email</h2>
            <p style="color: #6B7280; font-size: 15px; line-height: 1.6;">
                Click the button below to verify your email address and activate your BudgetIQ account.
            </p>
            <div style="text-align: center; margin: 28px 0;">
                <a href="{verify_url}"
                   style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6C63FF, #5A52E0);
                   color: #FFFFFF; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 15px;">
                    Verify Email Address
                </a>
            </div>
            <p style="color: #9CA3AF; font-size: 13px;">
                If the button doesn't work, copy and paste this link:<br/>
                <a href="{verify_url}" style="color: #6C63FF; word-break: break-all;">{verify_url}</a>
            </p>
            <p style="color: #9CA3AF; font-size: 13px; margin-top: 16px;">
                This link expires in 24 hours.
            </p>
        </div>
    </div>
    """
    _send_email_async(to_email, "BudgetIQ – Verify Your Email", html, "EMAIL VERIFY", verify_url)


def send_password_reset_email(to_email: str, reset_url: str) -> None:
    """Send password reset link asynchronously."""
    html = f"""
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="font-size: 28px; font-weight: 800; margin: 0;">
                <span style="background: linear-gradient(135deg, #6C63FF, #00C896);
                -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                background-clip: text;">BudgetIQ</span>
            </h1>
        </div>
        <div style="background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 16px; padding: 32px;">
            <h2 style="font-size: 20px; font-weight: 700; margin: 0 0 12px;">Reset Your Password</h2>
            <p style="color: #6B7280; font-size: 15px; line-height: 1.6;">
                We received a password reset request for your account. Click the button below to set a new password.
            </p>
            <div style="text-align: center; margin: 28px 0;">
                <a href="{reset_url}"
                   style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6C63FF, #5A52E0);
                   color: #FFFFFF; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 15px;">
                    Reset Password
                </a>
            </div>
            <p style="color: #9CA3AF; font-size: 13px;">
                If you didn't request this, you can safely ignore this email.
            </p>
        </div>
    </div>
    """
    _send_email_async(to_email, "BudgetIQ – Password Reset", html, "PASSWORD RESET", reset_url)
