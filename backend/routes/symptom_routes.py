from flask import Blueprint
from controllers.analysis_controller import (
    analyze, analyze_public, submit_feedback,
    ml_stats_endpoint, get_symptom_suggestions, get_my_history
)

symptom_bp = Blueprint("symptoms", __name__)

symptom_bp.route("/analyze",        methods=["POST"])(analyze)
symptom_bp.route("/analyze-public", methods=["POST"])(analyze_public)
symptom_bp.route("/feedback",       methods=["POST"])(submit_feedback)
symptom_bp.route("/ml-stats",       methods=["GET"])(ml_stats_endpoint)
symptom_bp.route("/suggest",        methods=["GET"])(get_symptom_suggestions)
symptom_bp.route("/history",        methods=["GET"])(get_my_history)