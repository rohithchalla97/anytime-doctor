from database import db
from models.doctor import Doctor

SAMPLE_DOCTORS = [
    { "full_name": "Dr. Rajesh Sharma",   "specialization": "General Physician",   "qualification": "MBBS, MD",        "experience": 12, "hospital": "City Care Hospital",       "location": "Surat, Gujarat", "fee": 300.0, "rating": 4.5, "available_days": "Mon,Tue,Wed,Thu,Fri", "slots": "09:00,10:00,11:00,14:00,15:00,16:00", "email": "rajesh@atd.com",  "password": "doctor123", "reg_number": "MCI-12345" },
    { "full_name": "Dr. Priya Mehta",     "specialization": "Cardiologist",         "qualification": "MBBS, MD, DM",    "experience": 15, "hospital": "Heart Care Centre",        "location": "Surat, Gujarat", "fee": 800.0, "rating": 4.8, "available_days": "Mon,Wed,Fri",         "slots": "10:00,11:00,14:00,15:00",             "email": "priya@atd.com",   "password": "doctor123", "reg_number": "MCI-22345" },
    { "full_name": "Dr. Anil Patel",      "specialization": "Neurologist",          "qualification": "MBBS, DM",        "experience": 10, "hospital": "NeuroLife Hospital",       "location": "Surat, Gujarat", "fee": 700.0, "rating": 4.6, "available_days": "Tue,Thu,Sat",         "slots": "09:00,10:00,11:00,15:00,16:00",       "email": "anil@atd.com",    "password": "doctor123", "reg_number": "MCI-32345" },
    { "full_name": "Dr. Sneha Joshi",     "specialization": "Dermatologist",        "qualification": "MBBS, MD",        "experience": 8,  "hospital": "SkinCare Clinic",          "location": "Surat, Gujarat", "fee": 500.0, "rating": 4.4, "available_days": "Mon,Tue,Wed,Thu,Fri,Sat", "slots": "10:00,11:00,12:00,16:00,17:00",  "email": "sneha@atd.com",   "password": "doctor123", "reg_number": "MCI-42345" },
    { "full_name": "Dr. Vikram Desai",    "specialization": "Gastroenterologist",   "qualification": "MBBS, DM",        "experience": 14, "hospital": "Digestive Health Centre",  "location": "Surat, Gujarat", "fee": 750.0, "rating": 4.7, "available_days": "Mon,Wed,Thu,Fri",     "slots": "09:00,10:00,14:00,15:00,16:00",       "email": "vikram@atd.com",  "password": "doctor123", "reg_number": "MCI-52345" },
    { "full_name": "Dr. Kavita Shah",     "specialization": "Psychiatrist",         "qualification": "MBBS, MD",        "experience": 9,  "hospital": "MindWell Clinic",          "location": "Surat, Gujarat", "fee": 600.0, "rating": 4.5, "available_days": "Tue,Thu,Sat",         "slots": "10:00,11:00,14:00,15:00",             "email": "kavita@atd.com",  "password": "doctor123", "reg_number": "MCI-62345" },
    { "full_name": "Dr. Ramesh Nair",     "specialization": "Orthopedist",          "qualification": "MBBS, MS",        "experience": 11, "hospital": "BoneJoint Hospital",       "location": "Surat, Gujarat", "fee": 650.0, "rating": 4.6, "available_days": "Mon,Tue,Wed,Fri",     "slots": "09:00,10:00,11:00,15:00,16:00",       "email": "ramesh@atd.com",  "password": "doctor123", "reg_number": "MCI-72345" },
    { "full_name": "Dr. Deepa Kulkarni",  "specialization": "Pulmonologist",        "qualification": "MBBS, MD",        "experience": 13, "hospital": "BreathEasy Hospital",      "location": "Surat, Gujarat", "fee": 700.0, "rating": 4.7, "available_days": "Mon,Wed,Thu,Fri",     "slots": "09:00,10:00,14:00,15:00,16:00",       "email": "deepa@atd.com",   "password": "doctor123", "reg_number": "MCI-82345" },
    { "full_name": "Dr. Suresh Iyer",     "specialization": "ENT Specialist",       "qualification": "MBBS, MS",        "experience": 7,  "hospital": "ENT Care Clinic",          "location": "Surat, Gujarat", "fee": 450.0, "rating": 4.3, "available_days": "Mon,Tue,Thu,Fri",     "slots": "10:00,11:00,12:00,15:00,16:00",       "email": "suresh@atd.com",  "password": "doctor123", "reg_number": "MCI-92345" },
    { "full_name": "Dr. Meena Verma",     "specialization": "Endocrinologist",      "qualification": "MBBS, DM",        "experience": 16, "hospital": "DiabetesCare Centre",      "location": "Surat, Gujarat", "fee": 850.0, "rating": 4.9, "available_days": "Tue,Wed,Fri",         "slots": "10:00,11:00,14:00,15:00",             "email": "meena@atd.com",   "password": "doctor123", "reg_number": "MCI-02345" },
]

def seed_doctors():
    if Doctor.query.count() == 0:
        for d in SAMPLE_DOCTORS:
            doc = Doctor(
                full_name=d['full_name'], specialization=d['specialization'],
                qualification=d['qualification'], experience=d['experience'],
                hospital=d['hospital'], location=d['location'],
                fee=d['fee'], rating=d['rating'],
                available_days=d['available_days'], slots=d['slots'],
                email=d.get('email'), reg_number=d.get('reg_number'),
            )
            doc.set_password(d.get('password', 'doctor123'))
            db.session.add(doc)
        db.session.commit()
        print(f"Seeded {len(SAMPLE_DOCTORS)} doctors")
    else:
        print("Doctors already exist — skipping seed")