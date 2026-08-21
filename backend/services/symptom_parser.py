from constants.symptom_weights import SYMPTOM_WEIGHTS

# Synonym/alias map — common variations that map to standard symptoms
SYMPTOM_ALIASES = {
    # Fever variants
    "temperature": "fever", "high temp": "high fever", "running temperature": "fever",
    "feeling hot": "fever", "feverish": "fever", "pyrexia": "fever",
    # Pain variants
    "ache": "pain", "aching": "pain", "hurts": "pain", "hurting": "pain",
    "chest ache": "chest pain", "heart pain": "chest pain", "cardiac pain": "chest pain",
    "tummy ache": "stomach pain", "tummy pain": "stomach pain", "abdominal pain": "stomach pain",
    "belly pain": "stomach pain", "belly ache": "stomach pain",
    "head ache": "headache", "migraines": "migraine",
    "back ache": "back pain", "lower back pain": "back pain",
    "knee ache": "knee pain", "leg ache": "leg pain",
    # Respiratory
    "can t breathe": "difficulty breathing", "cannot breathe": "difficulty breathing",
    "hard to breathe": "difficulty breathing", "trouble breathing": "breathlessness",
    "short of breath": "shortness of breath", "breathless": "breathlessness",
    "dry coughing": "dry cough", "wet coughing": "wet cough", "coughing": "cough",
    # Digestive
    "throwing up": "vomiting", "puking": "vomiting", "nauseous": "nausea",
    "feel sick": "nausea", "loose motion": "diarrhea", "loose stools": "diarrhea",
    "upset stomach": "stomach pain", "indigestion": "heartburn",
    "gas": "bloating", "gastric": "acidity",
    # Skin
    "itchy": "itching", "scratching": "itching", "skin rash": "rash",
    "pimples": "acne", "spots": "acne", "breakout": "acne",
    # Eyes
    "blurry vision": "blurred vision", "blurry eyes": "blurred vision",
    "red eyes": "eye redness", "pink eye": "eye redness",
    # Mental
    "stressed": "stress", "anxious": "anxiety", "depressed": "depression",
    "can t sleep": "insomnia", "sleepless": "insomnia", "no sleep": "insomnia",
    "worried": "anxiety", "panic": "panic attacks",
    # General
    "tired": "tiredness", "exhausted": "fatigue", "weakness": "weakness",
    "weight loss": "sudden weight loss", "losing weight": "sudden weight loss",
    "thirsty": "excessive thirst", "always thirsty": "excessive thirst",
    "frequent pee": "frequent urination", "urinating a lot": "frequent urination",
    "painful pee": "painful urination", "burning urination": "painful urination",
    "ear ache": "ear pain", "throat pain": "sore throat",
    "swollen": "swollen joints", "stiff": "stiffness", "stiff joints": "stiffness",
    "hair falling": "hair loss", "hair fall": "hair loss",
    "fainted": "fainting", "passed out": "fainting", "blackout": "fainting",
    "fits": "seizure", "convulsions": "seizure",
    "memory problems": "memory loss", "forgetful": "memory loss",
    "numb": "numbness", "tingling": "numbness",
    "irregular heartbeat": "irregular heartbeat", "heart pounding": "palpitations",
    "heart racing": "palpitations", "fast heartbeat": "palpitations",
}

# Body part to symptom hints
BODY_PART_HINTS = {
    "heart": ["chest pain", "palpitations"],
    "stomach": ["stomach pain", "nausea"],
    "head": ["headache", "dizziness"],
    "eye": ["eye pain", "eye redness"],
    "ear": ["ear pain", "hearing loss"],
    "throat": ["sore throat", "difficulty swallowing"],
    "skin": ["rash", "itching"],
    "knee": ["knee pain", "swollen joints"],
    "back": ["back pain"],
    "chest": ["chest pain", "chest tightness"],
    "lungs": ["cough", "breathlessness"],
    "kidney": ["kidney pain", "blood in urine"],
    "liver": ["stomach pain", "dark urine"],
}

def normalize_text(text: str) -> str:
    """Clean and normalize input text."""
    text = text.lower().strip()
    # Remove common filler phrases
    fillers = ["i have","i am","i feel","i am feeling","since","for","about","the","a ","an ",
               "some","little","bit of","very","quite","really","extremely","suddenly"]
    for f in fillers:
        text = text.replace(f" {f} ", " ")
    return " ".join(text.split())  # normalize whitespace

def apply_aliases(text: str) -> str:
    """Replace aliases with standard symptom names."""
    # Sort by length desc to match longer phrases first
    for alias, standard in sorted(SYMPTOM_ALIASES.items(), key=lambda x: len(x[0]), reverse=True):
        if alias in text:
            text = text.replace(alias, standard)
    return text

def extract_symptoms(text: str) -> dict:
    """
    Enhanced symptom extractor with:
    - Alias/synonym resolution
    - Plural handling
    - Body part hints
    - Filler word removal
    """
    # Step 1: normalize
    normalized = normalize_text(text)

    # Step 2: apply aliases
    aliased = apply_aliases(normalized)

    found = {}

    # Step 3: sort symptoms longest-first to avoid partial matches
    sorted_symptoms = sorted(SYMPTOM_WEIGHTS.keys(), key=len, reverse=True)

    # Step 4: match in both original and aliased text
    for symptom in sorted_symptoms:
        if symptom in aliased or symptom in normalized:
            found[symptom] = SYMPTOM_WEIGHTS[symptom]
            continue
        # Check plurals (fever→fevers, cough→coughs, ache→aches)
        plural = symptom + "s"
        if plural in aliased or plural in normalized:
            found[symptom] = SYMPTOM_WEIGHTS[symptom]
            continue
        # Check without spaces (back pain → backpain)
        nospace = symptom.replace(" ", "")
        if nospace in aliased.replace(" ",""):
            found[symptom] = SYMPTOM_WEIGHTS[symptom]

    # Step 5: body part hints (if "my chest hurts" → add chest pain)
    for part, hints in BODY_PART_HINTS.items():
        if part in normalized and not any(h in found for h in hints):
            for hint in hints[:1]:  # add only primary hint
                if hint in SYMPTOM_WEIGHTS:
                    found[hint] = SYMPTOM_WEIGHTS[hint]

    return found

def get_symptom_list() -> list:
    """Return all known symptom keywords."""
    return sorted(SYMPTOM_WEIGHTS.keys())

def suggest_symptoms(partial: str) -> list:
    """Autocomplete suggestions for partial symptom input."""
    partial = partial.lower()
    return [s for s in SYMPTOM_WEIGHTS.keys() if partial in s][:8]