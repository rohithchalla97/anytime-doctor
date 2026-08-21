from database import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class Doctor(db.Model):
    __tablename__ = 'doctors'

    id             = db.Column(db.Integer, primary_key=True)
    full_name      = db.Column(db.String(100), nullable=False)
    specialization = db.Column(db.String(100), nullable=False)
    qualification  = db.Column(db.String(200), nullable=False)
    experience     = db.Column(db.Integer,  default=0)
    hospital       = db.Column(db.String(150), nullable=False)
    location       = db.Column(db.String(150), nullable=False)
    fee            = db.Column(db.Float,    default=500.0)
    rating         = db.Column(db.Float,    default=4.0)
    available_days = db.Column(db.String(100), default='Mon,Tue,Wed,Thu,Fri')
    slots          = db.Column(db.String(300), default='09:00,10:00,11:00,14:00,15:00,16:00')
    is_active      = db.Column(db.Boolean,  default=True)
    email          = db.Column(db.String(120), unique=True, nullable=True)
    password       = db.Column(db.String(256), nullable=True)
    reg_number     = db.Column(db.String(50),  nullable=True)
    age            = db.Column(db.Integer,     nullable=True)
    gender         = db.Column(db.String(10),  nullable=True)
    mobile         = db.Column(db.String(15),  nullable=True)
    bio            = db.Column(db.Text,        nullable=True)
    languages      = db.Column(db.String(200), nullable=True)
    awards         = db.Column(db.Text,        nullable=True)
    publications   = db.Column(db.Text,        nullable=True)
    consultation_type = db.Column(db.String(50), default='In-Person')
    photo_url      = db.Column(db.String(300), nullable=True)
    signature_text = db.Column(db.String(200), nullable=True)
    created_at     = db.Column(db.DateTime, default=datetime.utcnow)
    appointments   = db.relationship('Appointment', backref='doctor', lazy=True)

    def set_password(self, pw): self.password = generate_password_hash(pw)
    def check_password(self, pw): return check_password_hash(self.password, pw) if self.password else False
    def get_slots(self): return self.slots.split(',') if self.slots else []
    def get_days(self):  return self.available_days.split(',') if self.available_days else []
    def get_languages(self): return self.languages.split(',') if self.languages else []

    def to_dict(self):
        return {
            'id': self.id, 'full_name': self.full_name,
            'specialization': self.specialization, 'qualification': self.qualification,
            'experience': self.experience, 'hospital': self.hospital,
            'location': self.location, 'fee': self.fee, 'rating': self.rating,
            'available_days': self.get_days(), 'slots': self.get_slots(),
            'is_active': self.is_active, 'email': self.email,
            'reg_number': self.reg_number, 'age': self.age, 'gender': self.gender,
            'mobile': self.mobile, 'bio': self.bio,
            'languages': self.get_languages(), 'awards': self.awards,
            'publications': self.publications,
            'consultation_type': self.consultation_type, 'photo_url': self.photo_url,
            'created_at': self.created_at.strftime('%Y-%m-%d'),
        }