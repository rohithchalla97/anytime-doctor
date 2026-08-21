from database import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = 'users'

    id           = db.Column(db.Integer, primary_key=True)
    full_name    = db.Column(db.String(100), nullable=False)
    email        = db.Column(db.String(120), unique=True, nullable=True)
    mobile       = db.Column(db.String(15),  unique=True, nullable=True)
    password     = db.Column(db.String(256), nullable=False)
    otp          = db.Column(db.String(6),   nullable=True)
    otp_expiry   = db.Column(db.DateTime,    nullable=True)
    is_verified  = db.Column(db.Boolean,     default=False)

    # Patient profile fields
    age          = db.Column(db.Integer,     nullable=True)
    gender       = db.Column(db.String(10),  nullable=True)   # Male/Female/Other
    weight       = db.Column(db.Float,       nullable=True)   # kg
    height       = db.Column(db.Float,       nullable=True)   # cm
    blood_group  = db.Column(db.String(5),   nullable=True)
    allergies    = db.Column(db.Text,        nullable=True)
    chronic_conditions = db.Column(db.Text,  nullable=True)
    emergency_contact  = db.Column(db.String(15), nullable=True)
    address      = db.Column(db.Text,        nullable=True)
    photo_url    = db.Column(db.String(300), nullable=True)

    created_at   = db.Column(db.DateTime,    default=datetime.utcnow)

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)

    def bmi(self):
        if self.weight and self.height and self.height > 0:
            h = self.height / 100
            return round(self.weight / (h * h), 1)
        return None

    def bmi_category(self):
        bmi = self.bmi()
        if bmi is None: return None
        if bmi < 18.5: return 'Underweight'
        if bmi < 25:   return 'Normal'
        if bmi < 30:   return 'Overweight'
        return 'Obese'

    def to_dict(self):
        return {
            'id':          self.id,
            'full_name':   self.full_name,
            'email':       self.email,
            'mobile':      self.mobile,
            'is_verified': self.is_verified,
            'age':         self.age,
            'gender':      self.gender,
            'weight':      self.weight,
            'height':      self.height,
            'blood_group': self.blood_group,
            'allergies':   self.allergies,
            'chronic_conditions': self.chronic_conditions,
            'emergency_contact':  self.emergency_contact,
            'address':     self.address,
            'photo_url':   self.photo_url,
            'bmi':         self.bmi(),
            'bmi_category': self.bmi_category(),
            'created_at':  self.created_at.strftime('%Y-%m-%d'),
        }