from database import db
from datetime import datetime

class Appointment(db.Model):
    __tablename__ = 'appointments'

    id           = db.Column(db.Integer, primary_key=True)
    user_id      = db.Column(db.Integer, db.ForeignKey('users.id'),   nullable=False)
    doctor_id    = db.Column(db.Integer, db.ForeignKey('doctors.id'), nullable=False)
    date         = db.Column(db.String(20),  nullable=False)   # e.g. "2024-03-25"
    time_slot    = db.Column(db.String(10),  nullable=False)   # e.g. "10:00"
    symptoms     = db.Column(db.Text,        nullable=True)
    severity     = db.Column(db.String(10),  default='LOW')
    status       = db.Column(db.String(20),  default='PENDING')
    # PENDING → CONFIRMED → COMPLETED / CANCELLED
    notes        = db.Column(db.Text,        nullable=True)
    created_at   = db.Column(db.DateTime,    default=datetime.utcnow)

    def to_dict(self):
        return {
            'id':         self.id,
            'user_id':    self.user_id,
            'doctor_id':  self.doctor_id,
            'doctor':     self.doctor.to_dict() if self.doctor else None,
            'date':       self.date,
            'time_slot':  self.time_slot,
            'symptoms':   self.symptoms,
            'severity':   self.severity,
            'status':     self.status,
            'notes':      self.notes,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S'),
        }