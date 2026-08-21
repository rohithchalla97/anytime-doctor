import random
import string
from datetime import datetime, timedelta

def generate_otp(length=6):
    """Generate a random numeric OTP."""
    return ''.join(random.choices(string.digits, k=length))

def get_otp_expiry(minutes=10):
    """Return expiry datetime (now + minutes)."""
    return datetime.utcnow() + timedelta(minutes=minutes)

def is_otp_expired(otp_expiry):
    """Check if OTP has expired."""
    if otp_expiry is None:
        return True
    return datetime.utcnow() > otp_expiry

def send_otp(contact, otp):
    """
    Mock OTP sender — prints to console.
    In production: replace with Twilio (SMS) or SendGrid (email).
    """
    print(f"\n{'='*40}")
    print(f"  OTP for {contact}: {otp}")
    print(f"  Valid for 10 minutes")
    print(f"{'='*40}\n")
    return True