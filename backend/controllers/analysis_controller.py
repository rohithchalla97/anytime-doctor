from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from models.symptoms_log import SymptomsLog
from services.symptom_parser import extract_symptoms, suggest_symptoms
from services.severity_engine import get_severity
from services.doctor_mapper   import map_doctors
from services.ml_engine       import get_adaptive_weight, record_feedback, get_ml_stats
import json

def _build_response(text, matched, severity, doctors, extra=None):
    ml_matched = {s: get_adaptive_weight(s) for s in matched}
    sev = get_severity(ml_matched)
    doc = map_doctors(ml_matched)
    base = {
        "input":            text,
        "matched_symptoms": ml_matched,
        "symptom_count":    len(ml_matched),
        "severity":         sev,
        "recommended":      doc,
        "ml_stats":         get_ml_stats(),
        "message":          f"Found {len(ml_matched)} symptom(s). Severity: {sev['level']}.",
        "suggestions":      suggest_symptoms(text.split()[-1]) if text else [],
    }
    if extra:
        base.update(extra)
    return base

def analyze_public():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body required"}), 400

    text = data.get("symptoms", "").strip()
    age  = data.get("age")
    duration = data.get("duration", "")

    # Validation
    if not text:
        return jsonify({"error": "Please describe your symptoms"}), 400
    if len(text) < 3:
        return jsonify({"error": "Please describe your symptoms in more detail"}), 400
    if len(text) > 1000:
        return jsonify({"error": "Description too long. Please keep it under 1000 characters"}), 400

    matched = extract_symptoms(text)

    # If nothing found, give helpful message
    if not matched:
        return jsonify({
            "input":            text,
            "matched_symptoms": {},
            "symptom_count":    0,
            "severity":         {"level":"LOW","score":0,"label":"No recognised symptoms found.","color":"#1D9E75"},
            "recommended":      {"primary":"General Physician","all":["General Physician"],"reasoning":[]},
            "message":          "No specific symptoms detected. Try describing differently — e.g. 'I have fever and headache'.",
            "suggestions":      suggest_symptoms(text.split()[0] if text.split() else ""),
            "tip":              "Try words like: fever, headache, cough, chest pain, stomach pain, rash, dizziness",
        }), 200

    # Age-based severity adjustment
    severity_boost = 0
    if age:
        try:
            age_int = int(age)
            if age_int < 5 or age_int > 65:
                severity_boost = 2  # children and elderly get higher concern
        except:
            pass

    ml_matched = {}
    for symptom in matched:
        w = get_adaptive_weight(symptom)
        ml_matched[symptom] = w + severity_boost if severity_boost else w

    severity = get_severity(ml_matched)
    doctors  = map_doctors(ml_matched)
    ml_stats = get_ml_stats()

    # Build warnings
    warnings = []
    if duration:
        dur_lower = duration.lower()
        if any(w in dur_lower for w in ["week","weeks","month","months"]):
            warnings.append("Symptoms lasting more than a week need medical evaluation.")
    if age and int(age) < 5:
        warnings.append("For children under 5, always consult a paediatrician promptly.")
    if age and int(age) > 65:
        warnings.append("For patients over 65, symptoms can progress quickly. Please seek care soon.")

    return jsonify({
        "input":            text,
        "matched_symptoms": ml_matched,
        "symptom_count":    len(ml_matched),
        "severity":         severity,
        "recommended":      doctors,
        "ml_stats":         ml_stats,
        "warnings":         warnings,
        "message":          f"Found {len(ml_matched)} symptom(s). Severity: {severity['level']}.",
    }), 200


@jwt_required()
def analyze():
    """Authenticated analysis — saves to history."""
    user_id = get_jwt_identity()
    # Reject doctor tokens
    if str(user_id).startswith("doctor_"):
        return jsonify({"error": "Use patient login for symptom analysis"}), 403

    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body required"}), 400

    text     = data.get("symptoms", "").strip()
    age      = data.get("age")
    duration = data.get("duration","")

    if not text or len(text) < 3:
        return jsonify({"error": "Please describe your symptoms in more detail"}), 400
    if len(text) > 1000:
        return jsonify({"error": "Description too long"}), 400

    matched = extract_symptoms(text)
    ml_matched = {s: get_adaptive_weight(s) for s in matched}
    severity = get_severity(ml_matched)
    doctors  = map_doctors(ml_matched)

    warnings = []
    if duration:
        dur_lower = duration.lower()
        if any(w in dur_lower for w in ["week","weeks","month","months"]):
            warnings.append("Symptoms lasting more than a week need medical evaluation.")

    # Save to symptoms log
    try:
        log = SymptomsLog(
            user_id=int(user_id),
            raw_input=text,
            matched_symptoms=json.dumps(ml_matched),
            severity_level=severity["level"],
            severity_score=severity["score"],
            recommended_doc=doctors["primary"],
        )
        db.session.add(log)
        db.session.commit()
    except Exception as e:
        print(f"Log save error: {e}")

    return jsonify({
        "input":            text,
        "matched_symptoms": ml_matched,
        "symptom_count":    len(ml_matched),
        "severity":         severity,
        "recommended":      doctors,
        "ml_stats":         get_ml_stats(),
        "warnings":         warnings,
        "message":          f"Found {len(ml_matched)} symptom(s). Severity: {severity['level']}.",
    }), 200


@jwt_required()
def submit_feedback():
    identity = get_jwt_identity()
    if str(identity).startswith("doctor_"):
        return jsonify({"error": "Unauthorized"}), 403
    data = request.get_json()
    symptoms = data.get("symptoms", [])
    severity = data.get("severity", "LOW")
    doctor   = data.get("doctor", None)
    if symptoms:
        record_feedback(symptoms, severity, doctor)
    return jsonify({"message": "Feedback recorded. Model updated."}), 200


def ml_stats_endpoint():
    return jsonify(get_ml_stats()), 200


def get_symptom_suggestions():
    """Autocomplete endpoint."""
    q = request.args.get("q", "").strip()
    if not q or len(q) < 2:
        return jsonify({"suggestions": []}), 200
    return jsonify({"suggestions": suggest_symptoms(q)}), 200


@jwt_required()
def get_my_history():
    """Get symptom check history for logged-in user."""
    user_id = get_jwt_identity()
    if str(user_id).startswith("doctor_"):
        return jsonify({"error": "Unauthorized"}), 403
    logs = SymptomsLog.query.filter_by(user_id=int(user_id))        .order_by(SymptomsLog.created_at.desc()).limit(20).all()
    return jsonify({"history": [l.to_dict() for l in logs]}), 200