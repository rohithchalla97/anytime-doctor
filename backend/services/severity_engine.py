from constants.severity_constants import (
    calculate_severity,
    CRITICAL_SYMPTOMS
)

def get_severity(matched_symptoms: dict) -> dict:
    """
    Calculate severity from matched symptoms.

    Args:
        matched_symptoms: {symptom: score} dict

    Returns:
        severity result dict with level, score, label, color
    """
    if not matched_symptoms:
        return {
            "level": "LOW",
            "score": 0,
            "label": "No symptoms detected.",
            "color": "#27ae60",
        }

    scores = list(matched_symptoms.values())

    # Check for any critical symptom
    for symptom in matched_symptoms:
        if symptom in CRITICAL_SYMPTOMS:
            return {
                "level":  "HIGH",
                "score":  sum(scores),
                "label":  "High — Seek immediate medical attention.",
                "color":  "#c0392b",
                "reason": f"Critical symptom detected: '{symptom}'",
            }

    return calculate_severity(scores)