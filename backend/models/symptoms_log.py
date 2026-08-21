from database import db
from datetime import datetime

class SymptomsLog(db.Model):
    __tablename__ = 'symptoms_log'

    id               = db.Column(db.Integer, primary_key=True)
    user_id          = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    raw_input        = db.Column(db.Text,    nullable=False)
    matched_symptoms = db.Column(db.Text,    nullable=True)   # JSON string
    severity_level   = db.Column(db.String(10), default='LOW')
    severity_score   = db.Column(db.Integer, default=0)
    recommended_doc  = db.Column(db.String(100), nullable=True)
    created_at       = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        import json
        return {
            'id':               self.id,
            'user_id':          self.user_id,
            'raw_input':        self.raw_input,
            'matched_symptoms': json.loads(self.matched_symptoms) if self.matched_symptoms else {},
            'severity_level':   self.severity_level,
            'severity_score':   self.severity_score,
            'recommended_doc':  self.recommended_doc,
            'created_at':       self.created_at.strftime('%Y-%m-%d %H:%M:%S'),
        }