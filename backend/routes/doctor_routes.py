from flask import Blueprint
from controllers.doctor_controller import (
    doctor_login, doctor_profile, my_patients,
    write_prescription, download_prescription,
    update_availability, export_appointments
)

doctor_bp = Blueprint('doctor', __name__)

doctor_bp.route('/login',                        methods=['POST'])(doctor_login)
doctor_bp.route('/profile',                      methods=['GET'])(doctor_profile)
doctor_bp.route('/patients',                     methods=['GET'])(my_patients)
doctor_bp.route('/prescribe',                    methods=['POST'])(write_prescription)
doctor_bp.route('/prescription/<int:prescription_id>/download', methods=['GET'])(download_prescription)
doctor_bp.route('/availability',                 methods=['PUT'])(update_availability)
doctor_bp.route('/export',                       methods=['GET'])(export_appointments)

from controllers.doctor_controller import update_doctor_profile
doctor_bp.route('/profile/update', methods=['PUT'])(update_doctor_profile)