from database import db
from datetime import datetime

class Prescription(db.Model):
    __tablename__ = 'prescriptions'

    id             = db.Column(db.Integer, primary_key=True)
    appointment_id = db.Column(db.Integer, db.ForeignKey('appointments.id'), nullable=False)
    user_id        = db.Column(db.Integer, db.ForeignKey('users.id'),        nullable=False)
    doctor_id      = db.Column(db.Integer, db.ForeignKey('doctors.id'),      nullable=False)
    diagnosis      = db.Column(db.Text,    nullable=True)
    medicines      = db.Column(db.Text,    nullable=True)   # JSON string
    advice         = db.Column(db.Text,    nullable=True)
    follow_up_date = db.Column(db.String(20), nullable=True)
    pdf_path       = db.Column(db.String(300), nullable=True)
    created_at     = db.Column(db.DateTime, default=datetime.utcnow)

    appointment = db.relationship('Appointment', backref='prescription', lazy=True)

    def to_dict(self):
        import json
        return {
            'id':             self.id,
            'appointment_id': self.appointment_id,
            'user_id':        self.user_id,
            'doctor_id':      self.doctor_id,
            'diagnosis':      self.diagnosis,
            'medicines':      json.loads(self.medicines) if self.medicines else [],
            'advice':         self.advice,
            'follow_up_date': self.follow_up_date,
            'pdf_path':       self.pdf_path,
            'created_at':     self.created_at.strftime('%Y-%m-%d %H:%M:%S'),
        }