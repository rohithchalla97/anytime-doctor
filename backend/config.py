import os

class Config:
    # App settings
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-only-secret')
    DEBUG = os.environ.get('FLASK_DEBUG', '0') == '1'

    # Database
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL',
        'postgresql+psycopg://postgres:your_password@localhost:5432/anytime_doctor',
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # JWT settings
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET', 'dev-only-jwt-secret')
    JWT_EXPIRY_HOURS = 24

    # OTP settings (mock — replace with real SMS in production)
    OTP_EXPIRY_MINUTES = 10
    OTP_LENGTH = 6

    # Upload folder for reports/images
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB

    # PDF output folder
    PDF_FOLDER = os.path.join(os.path.dirname(__file__), 'pdfs')