import json
import os
from datetime import datetime
from collections import defaultdict
from constants.symptom_weights import SYMPTOM_WEIGHTS
from constants.doctor_mapping import DOCTOR_MAPPING

# ── Learning data store (JSON file acts as simple ML memory) ──
LEARNING_FILE = os.path.join(os.path.dirname(__file__), '..', 'logs', 'ml_learning.json')

def _load_data():
    if os.path.exists(LEARNING_FILE):
        try:
            with open(LEARNING_FILE, 'r') as f:
                return json.load(f)
        except:
            pass
    return {"symptom_weights": {}, "doctor_feedback": {}, "total_cases": 0}

def _save_data(data):
    os.makedirs(os.path.dirname(LEARNING_FILE), exist_ok=True)
    with open(LEARNING_FILE, 'w') as f:
        json.dump(data, f, indent=2)

def get_adaptive_weight(symptom: str) -> float:
    """
    Return symptom weight — base weight adjusted by learned data.
    Over time, frequently confirmed severe symptoms get higher weights.
    """
    base = SYMPTOM_WEIGHTS.get(symptom, 2)
    data = _load_data()
    learned = data["symptom_weights"].get(symptom, {})

    if not learned:
        return base

    # Bayesian-style adjustment: if many users with this symptom
    # confirmed HIGH severity, increase weight slightly
    total     = learned.get("total", 0)
    high_conf = learned.get("high_confirmed", 0)

    if total >= 5:  # need at least 5 cases to learn
        high_ratio = high_conf / total
        # Adjust weight up to +2 or down to -1 based on confirmation rate
        adjustment = (high_ratio - 0.3) * 4
        adjusted   = base + adjustment
        return round(max(1, min(10, adjusted)), 2)

    return base

def record_feedback(symptoms: list, actual_severity: str, confirmed_doctor: str = None):
    """
    Record user feedback to improve future predictions.
    Called when a user books appointment (implicit confirmation).
    """
    data = _load_data()
    data["total_cases"] = data.get("total_cases", 0) + 1

    for symptom in symptoms:
        if symptom not in data["symptom_weights"]:
            data["symptom_weights"][symptom] = {"total": 0, "high_confirmed": 0, "medium_confirmed": 0}

        data["symptom_weights"][symptom]["total"] += 1
        if actual_severity == "HIGH":
            data["symptom_weights"][symptom]["high_confirmed"] += 1
        elif actual_severity == "MEDIUM":
            data["symptom_weights"][symptom]["medium_confirmed"] += 1

    if confirmed_doctor:
        for symptom in symptoms:
            key = f"{symptom}:{confirmed_doctor}"
            data["doctor_feedback"][key] = data["doctor_feedback"].get(key, 0) + 1

    _save_data(data)

def get_ml_stats() -> dict:
    """Return learning statistics for display."""
    data = _load_data()
    return {
        "total_cases_learned": data.get("total_cases", 0),
        "symptoms_tracked":    len(data.get("symptom_weights", {})),
        "model_version":       "adaptive-v1",
        "last_updated":        datetime.now().strftime("%Y-%m-%d"),
    }