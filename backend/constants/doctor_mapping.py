# ============================================================
# DOCTOR MAPPING
# Maps each symptom to the most appropriate specialist
# ============================================================

DOCTOR_MAPPING = {

    # ── General / Fever ──────────────────────────────────────
    "fever":                    "General Physician",
    "high fever":               "General Physician",
    "chills":                   "General Physician",
    "night sweats":             "General Physician",
    "fatigue":                  "General Physician",
    "tiredness":                "General Physician",
    "loss of appetite":         "General Physician",
    "runny nose":               "General Physician",
    "nasal congestion":         "General Physician",
    "sneezing":                 "General Physician",

    # ── Neurologist ──────────────────────────────────────────
    "headache":                 "Neurologist",
    "severe headache":          "Neurologist",
    "migraine":                 "Neurologist",
    "dizziness":                "Neurologist",
    "fainting":                 "Neurologist",
    "seizure":                  "Neurologist",
    "confusion":                "Neurologist",
    "memory loss":              "Neurologist",
    "numbness":                 "Neurologist",
    "paralysis":                "Neurologist",
    "stroke symptoms":          "Neurologist",

    # ── Cardiologist ─────────────────────────────────────────
    "chest pain":               "Cardiologist",
    "chest tightness":          "Cardiologist",
    "palpitations":             "Cardiologist",
    "irregular heartbeat":      "Cardiologist",
    "shortness of breath":      "Cardiologist",
    "heart attack symptoms":    "Cardiologist",

    # ── Pulmonologist ────────────────────────────────────────
    "cough":                    "Pulmonologist",
    "dry cough":                "Pulmonologist",
    "wet cough":                "Pulmonologist",
    "wheezing":                 "Pulmonologist",
    "breathlessness":           "Pulmonologist",
    "difficulty breathing":     "Pulmonologist",

    # ── ENT Specialist ───────────────────────────────────────
    "sore throat":              "ENT Specialist",
    "ear pain":                 "ENT Specialist",
    "hearing loss":             "ENT Specialist",
    "ear discharge":            "ENT Specialist",
    "tinnitus":                 "ENT Specialist",
    "voice hoarseness":         "ENT Specialist",
    "difficulty swallowing":    "ENT Specialist",

    # ── Gastroenterologist ───────────────────────────────────
    "stomach pain":             "Gastroenterologist",
    "severe stomach pain":      "Gastroenterologist",
    "nausea":                   "Gastroenterologist",
    "vomiting":                 "Gastroenterologist",
    "diarrhea":                 "Gastroenterologist",
    "constipation":             "Gastroenterologist",
    "bloating":                 "Gastroenterologist",
    "blood in stool":           "Gastroenterologist",
    "heartburn":                "Gastroenterologist",
    "acidity":                  "Gastroenterologist",

    # ── Dermatologist ────────────────────────────────────────
    "rash":                     "Dermatologist",
    "itching":                  "Dermatologist",
    "hives":                    "Dermatologist",
    "skin discoloration":       "Dermatologist",
    "acne":                     "Dermatologist",
    "eczema":                   "Dermatologist",
    "psoriasis":                "Dermatologist",
    "hair loss":                "Dermatologist",
    "nail problems":            "Dermatologist",

    # ── Ophthalmologist ──────────────────────────────────────
    "eye pain":                 "Ophthalmologist",
    "eye redness":              "Ophthalmologist",
    "watery eyes":              "Ophthalmologist",
    "eye discharge":            "Ophthalmologist",
    "blurred vision":           "Ophthalmologist",
    "vision loss":              "Ophthalmologist",

    # ── Orthopedist ──────────────────────────────────────────
    "joint pain":               "Orthopedist",
    "back pain":                "Orthopedist",
    "neck pain":                "Orthopedist",
    "swollen joints":           "Orthopedist",
    "stiffness":                "Orthopedist",
    "knee pain":                "Orthopedist",
    "leg pain":                 "Orthopedist",
    "muscle pain":              "Orthopedist",
    "weakness":                 "Orthopedist",

    # ── Nephrologist / Urologist ─────────────────────────────
    "frequent urination":       "Urologist",
    "painful urination":        "Urologist",
    "blood in urine":           "Nephrologist",
    "dark urine":               "Nephrologist",
    "kidney pain":              "Nephrologist",

    # ── Psychiatrist ─────────────────────────────────────────
    "anxiety":                  "Psychiatrist",
    "depression":               "Psychiatrist",
    "insomnia":                 "Psychiatrist",
    "mood swings":              "Psychiatrist",
    "panic attacks":            "Psychiatrist",
    "stress":                   "Psychiatrist",

    # ── Endocrinologist ──────────────────────────────────────
    "excessive thirst":         "Endocrinologist",
    "excessive hunger":         "Endocrinologist",
    "sudden weight loss":       "Endocrinologist",
    "sudden weight gain":       "Endocrinologist",
    "cold hands feet":          "Endocrinologist",

    # ── Emergency ────────────────────────────────────────────
    "unconsciousness":          "Emergency Department",
    "severe bleeding":          "Emergency Department",
    "anaphylaxis":              "Emergency Department",
    "stroke symptoms":          "Emergency Department",
    "heart attack symptoms":    "Emergency Department",
}

# All available specialists in the system
ALL_SPECIALISTS = list(set(DOCTOR_MAPPING.values()))