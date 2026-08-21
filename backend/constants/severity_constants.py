SEVERITY_LOW    = (0, 4)
SEVERITY_MEDIUM = (5, 9)
SEVERITY_HIGH   = (10, 999)

SEVERITY_LABELS = {
    "LOW":    "Low severity — Monitor symptoms at home. Consider booking in the next few days.",
    "MEDIUM": "Moderate severity — See a doctor within 24 to 48 hours.",
    "HIGH":   "High severity — Seek immediate medical attention urgently.",
}

SEVERITY_COLORS = {
    "LOW":    "#1D9E75",
    "MEDIUM": "#BA7517",
    "HIGH":   "#E24B4A",
}

CRITICAL_SCORE_THRESHOLD = 8

CRITICAL_SYMPTOMS = [
    "chest pain","chest tightness","heart attack symptoms","stroke symptoms",
    "unconsciousness","paralysis","severe bleeding","anaphylaxis","seizure",
    "difficulty breathing","vision loss","blood in urine","blood in stool","fainting",
]

def calculate_severity(symptom_scores: list) -> dict:
    if not symptom_scores:
        return {"level":"LOW","score":0,"label":SEVERITY_LABELS["LOW"],"color":SEVERITY_COLORS["LOW"]}
    total = sum(symptom_scores)
    max_score = max(symptom_scores)
    # Fixed: proper threshold checks
    if max_score >= CRITICAL_SCORE_THRESHOLD or total >= SEVERITY_HIGH[0]:
        level = "HIGH"
    elif total >= SEVERITY_MEDIUM[0]:
        level = "MEDIUM"
    else:
        level = "LOW"
    return {"level":level,"score":total,"label":SEVERITY_LABELS[level],"color":SEVERITY_COLORS[level]}