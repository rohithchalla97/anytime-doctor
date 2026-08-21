import os
import json
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer,
                                 Table, TableStyle, HRFlowable)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT

PDF_DIR = os.path.join(os.path.dirname(__file__), '..', 'pdfs')

def ensure_pdf_dir():
    os.makedirs(PDF_DIR, exist_ok=True)

def generate_prescription_pdf(prescription, doctor, patient, appointment):
    ensure_pdf_dir()
    filename = f"prescription_{prescription.id}_{datetime.now().strftime('%Y%m%d%H%M%S')}.pdf"
    filepath = os.path.join(PDF_DIR, filename)

    doc = SimpleDocTemplate(
        filepath, pagesize=A4,
        rightMargin=2*cm, leftMargin=2*cm,
        topMargin=2*cm, bottomMargin=2*cm
    )

    GREEN       = colors.HexColor('#0F6E56')
    LIGHT_GREEN = colors.HexColor('#E1F5EE')
    DARK        = colors.HexColor('#141414')
    GRAY        = colors.HexColor('#767676')
    LIGHT_GRAY  = colors.HexColor('#f7f6f2')

    story = []

    # Header
    story.append(Paragraph("AnytimeDoctor",
        ParagraphStyle('h', fontSize=22, fontName='Helvetica-Bold', textColor=GREEN)))
    story.append(Paragraph("Digital Health Platform · Rule-Based Medical Consultation",
        ParagraphStyle('s', fontSize=10, textColor=GRAY)))
    story.append(HRFlowable(width="100%", thickness=2, color=GREEN, spaceAfter=10))

    # Doctor info
    doc_name = doctor.full_name if doctor.full_name.startswith('Dr') else f"Dr. {doctor.full_name}"
    doc_data = [
        [Paragraph(doc_name, ParagraphStyle('dn', fontSize=14, fontName='Helvetica-Bold', textColor=DARK)),
         Paragraph(f"Reg: {doctor.reg_number or 'MCI-XXXXX'}", ParagraphStyle('dr', fontSize=10, textColor=GRAY))],
        [Paragraph(f"{doctor.specialization} · {doctor.qualification}", ParagraphStyle('ds', fontSize=10, textColor=GRAY)),
         Paragraph(f"Date: {appointment.date}", ParagraphStyle('dd', fontSize=10, textColor=GRAY))],
        [Paragraph(f"{doctor.hospital}, {doctor.location}", ParagraphStyle('dh', fontSize=10, textColor=GRAY)),
         Paragraph(f"Appt #: {appointment.id}", ParagraphStyle('da', fontSize=10, textColor=GRAY))],
    ]
    doc_table = Table(doc_data, colWidths=[11*cm, 6*cm])
    doc_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), LIGHT_GREEN),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(doc_table)
    story.append(Spacer(1, 14))

    # Patient info
    label_s = ParagraphStyle('lbl', fontSize=9, fontName='Helvetica-Bold', textColor=GRAY)
    val_s   = ParagraphStyle('val', fontSize=11, textColor=DARK)
    pat_data = [
        [Paragraph("PATIENT NAME", label_s), Paragraph("AGE / GENDER", label_s),
         Paragraph("BLOOD GROUP", label_s), Paragraph("MOBILE", label_s)],
        [Paragraph(patient.full_name or "—", val_s),
         Paragraph(f"{patient.age or '—'} / {patient.gender or '—'}", val_s),
         Paragraph(patient.blood_group or "—", val_s),
         Paragraph(patient.mobile or patient.email or "—", val_s)],
    ]
    pat_table = Table(pat_data, colWidths=[4.25*cm]*4)
    pat_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), LIGHT_GRAY),
        ('BACKGROUND', (0,1), (-1,1), colors.white),
        ('BOX',        (0,0), (-1,-1), 0.5, colors.HexColor('#c4c4c4')),
        ('INNERGRID',  (0,0), (-1,-1), 0.5, colors.HexColor('#e0e0e0')),
        ('PADDING',    (0,0), (-1,-1), 7),
    ]))
    story.append(pat_table)
    story.append(Spacer(1, 14))

    sec_s  = ParagraphStyle('sec', fontSize=11, fontName='Helvetica-Bold', textColor=GREEN, spaceAfter=4)
    body_s = ParagraphStyle('body', fontSize=10, textColor=DARK, leading=15)

    # Diagnosis
    story.append(Paragraph("Diagnosis", sec_s))
    story.append(Paragraph(prescription.diagnosis or 'As examined', body_s))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#e0e0e0'), spaceBefore=8, spaceAfter=10))

    # Medicines
    story.append(Paragraph("Rx — Prescription", sec_s))
    medicines = []
    try:
        medicines = json.loads(prescription.medicines) if prescription.medicines else []
    except:
        pass

    if medicines:
        wh = ParagraphStyle('wh', fontSize=9, fontName='Helvetica-Bold', textColor=colors.white)
        med_rows = [[Paragraph("Medicine", wh), Paragraph("Dosage", wh),
                     Paragraph("Duration", wh), Paragraph("Instructions", wh)]]
        for i, med in enumerate(medicines):
            med_rows.append([
                Paragraph(med.get('name',''), body_s),
                Paragraph(med.get('dosage',''), body_s),
                Paragraph(med.get('duration',''), body_s),
                Paragraph(med.get('instructions','As directed'), body_s),
            ])
        med_table = Table(med_rows, colWidths=[5*cm, 3*cm, 3*cm, 6*cm])
        med_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), GREEN),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [LIGHT_GREEN, colors.white]),
            ('BOX',       (0,0), (-1,-1), 0.5, colors.HexColor('#c4c4c4')),
            ('INNERGRID', (0,0), (-1,-1), 0.3, colors.HexColor('#e0e0e0')),
            ('PADDING',   (0,0), (-1,-1), 7),
        ]))
        story.append(med_table)
    else:
        story.append(Paragraph("No medicines prescribed.", body_s))

    story.append(Spacer(1, 14))

    if prescription.advice:
        story.append(Paragraph("Doctor's Advice", sec_s))
        story.append(Paragraph(prescription.advice, body_s))
        story.append(Spacer(1, 10))

    if prescription.follow_up_date:
        story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#e0e0e0'), spaceAfter=8))
        story.append(Paragraph(f"Follow-up Date: {prescription.follow_up_date}",
            ParagraphStyle('fu', fontSize=10, fontName='Helvetica-Bold', textColor=colors.HexColor('#BA7517'))))
        story.append(Spacer(1, 14))

    # Signature
    story.append(HRFlowable(width="100%", thickness=1, color=GREEN, spaceBefore=10, spaceAfter=10))
    sig_data = [[
        Paragraph(f"Generated: {datetime.now().strftime('%d %b %Y, %I:%M %p')}",
                  ParagraphStyle('ts', fontSize=8, textColor=GRAY)),
        Paragraph(f"{doc_name}\n{doctor.specialization}\nReg: {doctor.reg_number or 'MCI-XXXXX'}",
                  ParagraphStyle('sig', fontSize=10, fontName='Helvetica-Bold', textColor=DARK, alignment=TA_RIGHT)),
    ]]
    sig_table = Table(sig_data, colWidths=[9*cm, 8*cm])
    sig_table.setStyle(TableStyle([('PADDING', (0,0), (-1,-1), 0)]))
    story.append(sig_table)
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        "This is a computer-generated prescription. Not a substitute for professional medical advice.",
        ParagraphStyle('warn', fontSize=7, textColor=GRAY, alignment=TA_CENTER)
    ))

    doc.build(story)
    return filename, filepath