from flask import Blueprint
from controllers.appointment_controller import (
    get_doctors, get_doctor, get_slots,
    book_appointment, my_appointments, cancel_appointment
)

appointment_bp = Blueprint('appointments', __name__)

appointment_bp.route('/doctors',              methods=['GET'])(get_doctors)
appointment_bp.route('/doctors/<int:doctor_id>', methods=['GET'])(get_doctor)
appointment_bp.route('/slots/<int:doctor_id>',   methods=['GET'])(get_slots)
appointment_bp.route('/book',                 methods=['POST'])(book_appointment)
appointment_bp.route('/my',                   methods=['GET'])(my_appointments)
appointment_bp.route('/cancel/<int:appt_id>', methods=['PUT'])(cancel_appointment)