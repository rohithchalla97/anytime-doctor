# ============================================================
# SYMPTOM WEIGHTS
# Each symptom has a score from 1 (mild) to 10 (critical)
# These scores are used by the Severity Engine
# ============================================================

SYMPTOM_WEIGHTS = {

    # ── Fever & Temperature ──────────────────────────────────
    "fever":                    3,
    "high fever":               6,
    "chills":                   2,
    "night sweats":             3,

    # ── Head & Neuro ─────────────────────────────────────────
    "headache":                 2,
    "severe headache":          6,
    "migraine":                 5,
    "dizziness":                3,
    "fainting":                 7,
    "seizure":                  9,
    "confusion":                8,
    "memory loss":              7,
    "numbness":                 5,
    "blurred vision":           5,

    # ── Chest & Heart ────────────────────────────────────────
    "chest pain":               9,
    "chest tightness":          8,
    "palpitations":             6,
    "irregular heartbeat":      8,
    "shortness of breath":      8,

    # ── Lungs & Respiratory ──────────────────────────────────
    "cough":                    2,
    "dry cough":                2,
    "wet cough":                3,
    "wheezing":                 5,
    "breathlessness":           7,
    "sore throat":              2,
    "runny nose":               1,
    "nasal congestion":         1,
    "sneezing":                 1,

    # ── Stomach & Digestive ──────────────────────────────────
    "stomach pain":             4,
    "severe stomach pain":      8,
    "nausea":                   3,
    "vomiting":                 4,
    "diarrhea":                 4,
    "constipation":             2,
    "bloating":                 2,
    "loss of appetite":         3,
    "blood in stool":           8,
    "heartburn":                2,
    "acidity":                  2,

    # ── Skin ─────────────────────────────────────────────────
    "rash":                     3,
    "itching":                  2,
    "hives":                    4,
    "skin discoloration":       3,
    "acne":                     1,
    "eczema":                   3,
    "psoriasis":                3,
    "hair loss":                2,
    "nail problems":            1,

    # ── Eyes ─────────────────────────────────────────────────
    "eye pain":                 4,
    "eye redness":              3,
    "watery eyes":              2,
    "eye discharge":            3,
    "vision loss":              9,

    # ── Ear, Nose, Throat ────────────────────────────────────
    "ear pain":                 3,
    "hearing loss":             5,
    "ear discharge":            4,
    "tinnitus":                 3,
    "voice hoarseness":         2,
    "difficulty swallowing":    5,

    # ── Muscles & Joints ─────────────────────────────────────
    "joint pain":               4,
    "muscle pain":              3,
    "back pain":                4,
    "neck pain":                3,
    "swollen joints":           5,
    "stiffness":                3,
    "weakness":                 5,
    "leg pain":                 3,
    "knee pain":                3,

    # ── Urinary & Kidney ─────────────────────────────────────
    "frequent urination":       3,
    "painful urination":        4,
    "blood in urine":           8,
    "dark urine":               4,
    "kidney pain":              6,

    # ── Mental Health ────────────────────────────────────────
    "anxiety":                  4,
    "depression":               5,
    "insomnia":                 3,
    "mood swings":              3,
    "panic attacks":            6,
    "stress":                   3,

    # ── Diabetes & Hormonal ──────────────────────────────────
    "excessive thirst":         4,
    "excessive hunger":         3,
    "sudden weight loss":       6,
    "sudden weight gain":       4,
    "fatigue":                  3,
    "tiredness":                2,
    "cold hands feet":          3,

    # ── Emergency ────────────────────────────────────────────
    "unconsciousness":          10,
    "paralysis":                10,
    "stroke symptoms":          10,
    "heart attack symptoms":    10,
    "severe bleeding":          10,
    "difficulty breathing":     9,
    "anaphylaxis":              10,
}