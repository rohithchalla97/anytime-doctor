import os

from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from sqlalchemy import text
from database import db

load_dotenv()

app = Flask(__name__)

configured_origins = [
    origin.strip()
    for origin in os.environ.get(
        "CORS_ORIGINS", "http://localhost:3000"
    ).split(",")
    if origin.strip()
]
allowed_origins = configured_origins + [
    origin for origin in ("capacitor://localhost", "http://localhost")
    if origin not in configured_origins
]

CORS(app, resources={r"/api/*": {"origins": allowed_origins}},
     supports_credentials=True,
     allow_headers=["Content-Type","Authorization"],
     methods=["GET","POST","PUT","DELETE","OPTIONS"])

app.config["SECRET_KEY"]                     = os.environ.get("SECRET_KEY", "dev-only-secret")
database_url = os.environ.get("DATABASE_URL", "").strip().strip('"').strip("'").strip()
for variable_name in ("DATABASE_URL=", "DATABASE_URL_POOLED="):
    if database_url.startswith(variable_name):
        database_url = database_url.removeprefix(variable_name).strip().strip('"').strip("'")
        break
if os.environ.get("DATABASE_URL") is not None and not database_url:
    raise RuntimeError("DATABASE_URL is empty; set it to the Neon PostgreSQL connection string.")
if database_url.startswith("postgres://"):
    database_url = "postgresql+psycopg://" + database_url[len("postgres://"):]
elif database_url.startswith("postgresql://"):
    database_url = "postgresql+psycopg://" + database_url[len("postgresql://"):]
app.config["SQLALCHEMY_DATABASE_URI"] = database_url or (
    "postgresql+psycopg://anytime_doctor_v2:your_password@localhost:5432/anytime_doctor_v2"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"]                 = os.environ.get("JWT_SECRET", "dev-only-jwt-secret")
app.config["JWT_ACCESS_TOKEN_EXPIRES"]       = False

db.init_app(app)
jwt = JWTManager(app)

from routes.auth_routes        import auth_bp
from routes.symptom_routes     import symptom_bp
from routes.appointment_routes import appointment_bp
from routes.doctor_routes      import doctor_bp

app.register_blueprint(auth_bp,        url_prefix="/api/auth")
app.register_blueprint(symptom_bp,     url_prefix="/api/symptoms")
app.register_blueprint(appointment_bp, url_prefix="/api/appointments")
app.register_blueprint(doctor_bp,      url_prefix="/api/doctor")

@app.route("/")
def index():
    return {"message":"Anytime Doctor API","status":"OK","version":"2.0"}

@app.route("/api/health")
def health():
    db.session.execute(text("SELECT 1"))
    return {"status": "OK", "database": "connected"}

with app.app_context():
    from models.user         import User
    from models.doctor       import Doctor
    from models.appointment  import Appointment
    from models.symptoms_log import SymptomsLog
    from models.prescription import Prescription
    db.create_all()
    print("Database tables created")
    from utils.seeder import seed_doctors
    seed_doctors()

if __name__ == "__main__":
    app.run(
        debug=os.environ.get("FLASK_DEBUG", "0") == "1",
        port=int(os.environ.get("PORT", "5000")),
        host="0.0.0.0",
    )