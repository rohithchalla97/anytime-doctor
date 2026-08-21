from flask import request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from database import db
from models.user import User
from utils.otp_helper import generate_otp, get_otp_expiry, is_otp_expired, send_otp

def register():
    data      = request.get_json()
    full_name = data.get('full_name', '').strip()
    email     = data.get('email', '').strip().lower()
    mobile    = data.get('mobile', '').strip()
    password  = data.get('password', '')

    if not full_name:
        return jsonify({'error': 'Full name is required'}), 400
    if not password or len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400
    if not email and not mobile:
        return jsonify({'error': 'Email or mobile number is required'}), 400
    if email and User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered'}), 409
    if mobile and User.query.filter_by(mobile=mobile).first():
        return jsonify({'error': 'Mobile number already registered'}), 409

    user = User(full_name=full_name, email=email or None, mobile=mobile or None)
    user.set_password(password)
    otp = generate_otp()
    user.otp        = otp
    user.otp_expiry = get_otp_expiry(minutes=60)
    db.session.add(user)
    db.session.commit()
    contact = email or mobile
    send_otp(contact, otp)
    return jsonify({'message': f'Registration successful. OTP sent to {contact}', 'user_id': user.id}), 201

def verify_otp():
    data    = request.get_json()
    user_id = data.get('user_id')
    otp     = data.get('otp', '').strip()
    if not user_id or not otp:
        return jsonify({'error': 'user_id and otp are required'}), 400
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    if is_otp_expired(user.otp_expiry):
        return jsonify({'error': 'OTP has expired. Please request a new one'}), 400
    if user.otp != otp:
        return jsonify({'error': 'Invalid OTP'}), 400
    user.is_verified = True
    user.otp         = None
    user.otp_expiry  = None
    db.session.commit()
    token = create_access_token(identity=str(user.id))
    return jsonify({'message': 'OTP verified successfully', 'token': token, 'user': user.to_dict()}), 200

def resend_otp():
    data    = request.get_json()
    user_id = data.get('user_id')
    user    = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    if user.is_verified:
        return jsonify({'error': 'User is already verified'}), 400
    otp             = generate_otp()
    user.otp        = otp
    user.otp_expiry = get_otp_expiry(minutes=60)
    db.session.commit()
    contact = user.email or user.mobile
    send_otp(contact, otp)
    return jsonify({'message': f'New OTP sent to {contact}'}), 200

def login():
    data     = request.get_json()
    contact  = data.get('contact', '').strip().lower()
    password = data.get('password', '')
    if not contact or not password:
        return jsonify({'error': 'Contact and password are required'}), 400
    user = User.query.filter((User.email == contact) | (User.mobile == contact)).first()
    if not user:
        return jsonify({'error': 'No account found with this email or mobile'}), 404
    if not user.check_password(password):
        return jsonify({'error': 'Incorrect password'}), 401
    if not user.is_verified:
        return jsonify({'error': 'Account not verified', 'user_id': user.id}), 403
    token = create_access_token(identity=str(user.id))
    return jsonify({'message': 'Login successful', 'token': token, 'user': user.to_dict()}), 200

@jwt_required()
def get_profile():
    user = User.query.get(int(get_jwt_identity()))
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'user': user.to_dict()}), 200

@jwt_required()
def update_profile():
    user = User.query.get(int(get_jwt_identity()))
    if not user:
        return jsonify({'error': 'User not found'}), 404
    data = request.get_json()
    fields = ['age','gender','weight','height','blood_group',
              'allergies','chronic_conditions','emergency_contact','address','photo_url','full_name','mobile']
    for f in fields:
        if f in data:
            setattr(user, f, data[f])
    db.session.commit()
    return jsonify({'message': 'Profile updated successfully', 'user': user.to_dict()}), 200

def get_otp_debug():
    data = request.get_json()
    user = User.query.get(data.get('user_id'))
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'user_id': user.id, 'email': user.email, 'otp': user.otp, 'is_verified': user.is_verified}), 200