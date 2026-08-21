from constants.doctor_mapping import DOCTOR_MAPPING
from collections import Counter

def map_doctors(matched_symptoms: dict) -> dict:
    """
    Map matched symptoms to the best specialist(s).

    Args:
        matched_symptoms: {symptom: score} dict

    Returns:
        dict with primary doctor, all suggestions, reasoning
    """
    if not matched_symptoms:
        return {
            "primary":     "General Physician",
            "all":         ["General Physician"],
            "reasoning":   "No specific symptoms detected.",
        }

    specialists = []
    reasoning   = []

    for symptom, score in matched_symptoms.items():
        doctor = DOCTOR_MAPPING.get(symptom, "General Physician")
        specialists.append(doctor)
        reasoning.append(f"{symptom} → {doctor}")

    # Count most frequent specialist
    count   = Counter(specialists)
    primary = count.most_common(1)[0][0]
    unique  = list(dict.fromkeys(specialists))  # preserve order, remove dupes

    return {
        "primary":   primary,
        "all":       unique,
        "reasoning": reasoning,
    }