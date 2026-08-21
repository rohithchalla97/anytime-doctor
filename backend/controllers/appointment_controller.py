from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from models.doctor      import Doctor
from models.appointment import Appointment
from models.symptoms_log import SymptomsLog
import json

# ─────────────────────────────────────────
# LIST DOCTORS (by specialization)
# ─────────────────────────────────────────
def get_doctors():
    spec = request.args.get('specialization', '').strip()

    if spec:
        doctors = Doctor.query.filter(
            Doctor.specialization.ilike(f'%{spec}%'),
            Doctor.is_active == True
        ).all()
    else:
        doctors = Doctor.query.filter_by(is_active=True).all()

    return jsonify({
        'doctors': [d.to_dict() for d in doctors],
        'count':   len(doctors)
    }), 200


# ─────────────────────────────────────────
# GET SINGLE DOCTOR
# ─────────────────────────────────────────
def get_doctor(doctor_id):
    doctor = Doctor.query.get(doctor_id)
    if not doctor:
        return jsonify({'error': 'Doctor not found'}), 404
    return jsonify({'doctor': doctor.to_dict()}), 200


# ─────────────────────────────────────────
# GET AVAILABLE SLOTS
# ─────────────────────────────────────────
def get_slots(doctor_id):
    date = request.args.get('date', '').strip()

    doctor = Doctor.query.get(doctor_id)
    if not doctor:
        return jsonify({'error': 'Doctor not found'}), 404

    if not date:
        return jsonify({'error': 'Date is required (YYYY-MM-DD)'}), 400

    all_slots = doctor.get_slots()

    # Find already booked slots for this doctor+date
    booked = Appointment.query.filter_by(
        doctor_id=doctor_id,
        date=date
    ).filter(Appointment.status != 'CANCELLED').all()

    booked_times = [a.time_slot for a in booked]
    available    = [s for s in all_slots if s not in booked_times]

    return jsonify({
        'doctor_id':  doctor_id,
        'date':       date,
        'all_slots':  all_slots,
        'booked':     booked_times,
        'available':  available,
    }), 200


# ─────────────────────────────────────────
# BOOK APPOINTMENT
# ─────────────────────────────────────────
@jwt_required()
def book_appointment():
    user_id_str = get_jwt_identity()
    if str(user_id_str).startswith('doctor_'):
        return jsonify({'error': 'Doctors cannot book appointments. Use patient login.'}), 403
    user_id = int(user_id_str)
    data    = request.get_json()

    doctor_id = data.get('doctor_id')
    date      = data.get('date', '').strip()
    time_slot = data.get('time_slot', '').strip()
    symptoms  = data.get('symptoms', '')
    severity  = data.get('severity', 'LOW')

    # Validation
    if not all([doctor_id, date, time_slot]):
        return jsonify({'error': 'doctor_id, date, and time_slot are required'}), 400

    doctor = Doctor.query.get(doctor_id)
    if not doctor:
        return jsonify({'error': 'Doctor not found'}), 404

    # Check slot already booked by anyone
    existing = Appointment.query.filter_by(
        doctor_id=doctor_id,
        date=date,
        time_slot=time_slot
    ).filter(Appointment.status != 'CANCELLED').first()

    # Check this user doesn't already have an appointment with this doctor on this date
    user_existing = Appointment.query.filter_by(
        user_id=user_id,
        doctor_id=doctor_id,
        date=date
    ).filter(Appointment.status != 'CANCELLED').first()
    if user_existing:
        return jsonify({'error': 'You already have an appointment with this doctor on this date'}), 409

    if existing:
        return jsonify({'error': f'Slot {time_slot} on {date} is already booked'}), 409

    # Create appointment
    appt = Appointment(
        user_id=user_id,
        doctor_id=doctor_id,
        date=date,
        time_slot=time_slot,
        symptoms=symptoms,
        severity=severity,
        status='CONFIRMED'
    )
    db.session.add(appt)

    # Save symptoms log
    if symptoms:
        log = SymptomsLog(
            user_id=user_id,
            raw_input=symptoms,
            severity_level=severity,
            recommended_doc=doctor.specialization
        )
        db.session.add(log)

    db.session.commit()

    return jsonify({
        'message':     'Appointment booked successfully',
        'appointment': appt.to_dict()
    }), 201


# ─────────────────────────────────────────
# MY APPOINTMENTS
# ─────────────────────────────────────────
@jwt_required()
def my_appointments():
    user_id = int(get_jwt_identity())
    status  = request.args.get('status', '').upper()

    query = Appointment.query.filter_by(user_id=user_id)
    if status:
        query = query.filter_by(status=status)

    appts = query.order_by(Appointment.created_at.desc()).all()

    return jsonify({
        'appointments': [a.to_dict() for a in appts],
        'count':        len(appts)
    }), 200


# ─────────────────────────────────────────
# CANCEL APPOINTMENT
# ─────────────────────────────────────────
@jwt_required()
def cancel_appointment(appt_id):
    user_id = int(get_jwt_identity())

    appt = Appointment.query.filter_by(id=appt_id, user_id=user_id).first()
    if not appt:
        return jsonify({'error': 'Appointment not found'}), 404

    if appt.status == 'COMPLETED':
        return jsonify({'error': 'Cannot cancel a completed appointment'}), 400

    appt.status = 'CANCELLED'
    db.session.commit()

    return jsonify({'message': 'Appointment cancelled successfully'}), 200