from flask import Blueprint
from controllers.auth_controller import (
    register, verify_otp, resend_otp, login,
    get_profile, update_profile, get_otp_debug
)

auth_bp = Blueprint('auth', __name__)

auth_bp.route('/register',       methods=['POST'])(register)
auth_bp.route('/verify-otp',     methods=['POST'])(verify_otp)
auth_bp.route('/resend-otp',     methods=['POST'])(resend_otp)
auth_bp.route('/login',          methods=['POST'])(login)
auth_bp.route('/profile',        methods=['GET'])(get_profile)
auth_bp.route('/profile/update', methods=['PUT'])(update_profile)
auth_bp.route('/debug-otp',      methods=['POST'])(get_otp_debug)