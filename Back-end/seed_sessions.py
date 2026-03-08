# ============================================================
# seed_sessions.py — Crea 10 sesiones de ejemplo en la BD
# 3 sesiones para el Día 1 (Oct 1), 3 para el Día 2 (Oct 2),
# 4 para el Día 3 (Oct 3). Borra las existentes antes.
# Uso: python seed_sessions.py  (con venv activado)
# ============================================================

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.db.session import SessionLocal
from app.models.session import Session, SessionStatus, SessionModality, SessionTrack, SessionEventType

# ── Datos de las 10 conferencias ──────────────────────────────
SESSIONS = [
    # ── DÍA 1: 2026-10-01 ──────────────────────────────────────
    {
        "titulo":          "Inteligencia Artificial Generativa: Estado del Arte",
        "descripcion":     "Exploración de los modelos de lenguaje y difusión más recientes y su impacto en la industria.",
        "ponente":         "Dra. María López",
        "afiliacion":      "Universidad Nacional",
        "track":           SessionTrack.IA,
        "event_type":      SessionEventType.CONFERENCE,
        "dia":             "2026-10-01",
        "hora_inicio":     "09:00",
        "hora_fin":        "10:00",
        "salon":           "Auditorio Principal",
        "modalidad":       SessionModality.HIBRIDO,
        "status_logistico":SessionStatus.NORMAL,
        "cupos_totales":   200,
        "link_virtual":    "https://meet.google.com/ejemplo-dia1-1",
        "link_verificado": True,
    },
    {
        "titulo":          "Ciberseguridad en Infraestructuras Críticas",
        "descripcion":     "Análisis de amenazas modernas y estrategias de defensa para sistemas industriales.",
        "ponente":         "Ing. Carlos Mendoza",
        "afiliacion":      "CyberSec Colombia",
        "track":           SessionTrack.CIBERSEGURIDAD,
        "event_type":      SessionEventType.CONFERENCE,
        "dia":             "2026-10-01",
        "hora_inicio":     "10:30",
        "hora_fin":        "11:30",
        "salon":           "Sala A",
        "modalidad":       SessionModality.PRESENCIAL,
        "status_logistico":SessionStatus.NORMAL,
        "cupos_totales":   80,
        "link_virtual":    None,
        "link_verificado": False,
    },
    {
        "titulo":          "Taller: Despliegue de Modelos ML con FastAPI",
        "descripcion":     "Taller práctico para llevar un modelo de machine learning a producción usando FastAPI y Docker.",
        "ponente":         "Ing. Andrés Torres",
        "afiliacion":      "TechLab Medellín",
        "track":           SessionTrack.DESARROLLO,
        "event_type":      SessionEventType.WORKSHOP,
        "dia":             "2026-10-01",
        "hora_inicio":     "14:00",
        "hora_fin":        "16:00",
        "salon":           "Sala de Cómputo 1",
        "modalidad":       SessionModality.PRESENCIAL,
        "status_logistico":SessionStatus.NORMAL,
        "cupos_totales":   30,
        "link_virtual":    None,
        "link_verificado": False,
    },

    # ── DÍA 2: 2026-10-02 ──────────────────────────────────────
    {
        "titulo":          "Internet de las Cosas: Retos de Conectividad Masiva",
        "descripcion":     "Protocolos, plataformas y desafíos de escalar soluciones IoT a millones de dispositivos.",
        "ponente":         "Msc. Valentina Ríos",
        "afiliacion":      "Universidad de los Andes",
        "track":           SessionTrack.IOT,
        "event_type":      SessionEventType.CONFERENCE,
        "dia":             "2026-10-02",
        "hora_inicio":     "09:00",
        "hora_fin":        "10:00",
        "salon":           "Auditorio Principal",
        "modalidad":       SessionModality.HIBRIDO,
        "status_logistico":SessionStatus.NORMAL,
        "cupos_totales":   200,
        "link_virtual":    "https://meet.google.com/ejemplo-dia2-1",
        "link_verificado": True,
    },
    {
        "titulo":          "Panel: Ética en la Inteligencia Artificial",
        "descripcion":     "Mesa redonda con expertos debatiendo los dilemas éticos del uso de IA en decisiones críticas.",
        "ponente":         "Varios Panelistas",
        "afiliacion":      "CONIITI 2026",
        "track":           SessionTrack.INNOVACION,
        "event_type":      SessionEventType.PANEL,
        "dia":             "2026-10-02",
        "hora_inicio":     "10:30",
        "hora_fin":        "12:00",
        "salon":           "Auditorio Principal",
        "modalidad":       SessionModality.HIBRIDO,
        "status_logistico":SessionStatus.NORMAL,
        "cupos_totales":   200,
        "link_virtual":    "https://meet.google.com/ejemplo-dia2-2",
        "link_verificado": False,
    },
    {
        "titulo":          "Ciencia de Datos Aplicada a Salud Pública",
        "descripcion":     "Casos de uso reales donde la ciencia de datos ha transformado sistemas de salud en Latinoamérica.",
        "ponente":         "Dr. Felipe Gómez",
        "afiliacion":      "Hospital Universitario",
        "track":           SessionTrack.DATOS,
        "event_type":      SessionEventType.CONFERENCE,
        "dia":             "2026-10-02",
        "hora_inicio":     "14:00",
        "hora_fin":        "15:00",
        "salon":           "Sala B",
        "modalidad":       SessionModality.PRESENCIAL,
        "status_logistico":SessionStatus.NORMAL,
        "cupos_totales":   60,
        "link_virtual":    None,
        "link_verificado": False,
    },

    # ── DÍA 3: 2026-10-03 ──────────────────────────────────────
    {
        "titulo":          "Arquitecturas de Microservicios con Kubernetes",
        "descripcion":     "Guía práctica para diseñar, desplegar y escalar microservicios con Kubernetes y Helm.",
        "ponente":         "Ing. Laura Castillo",
        "afiliacion":      "CloudOps S.A.",
        "track":           SessionTrack.DESARROLLO,
        "event_type":      SessionEventType.CONFERENCE,
        "dia":             "2026-10-03",
        "hora_inicio":     "09:00",
        "hora_fin":        "10:00",
        "salon":           "Auditorio Principal",
        "modalidad":       SessionModality.HIBRIDO,
        "status_logistico":SessionStatus.NORMAL,
        "cupos_totales":   200,
        "link_virtual":    "https://meet.google.com/ejemplo-dia3-1",
        "link_verificado": True,
    },
    {
        "titulo":          "Simposio: Innovación Tecnológica en la Educación Superior",
        "descripcion":     "Experiencias y tendencias en la adopción de tecnología dentro de universidades iberoamericanas.",
        "ponente":         "Dra. Sofía Bermúdez",
        "afiliacion":      "Red Iberoamericana de Universidades",
        "track":           SessionTrack.INNOVACION,
        "event_type":      SessionEventType.SYMPOSIUM,
        "dia":             "2026-10-03",
        "hora_inicio":     "10:30",
        "hora_fin":        "12:00",
        "salon":           "Auditorio Principal",
        "modalidad":       SessionModality.VIRTUAL,
        "status_logistico":SessionStatus.NORMAL,
        "cupos_totales":   500,
        "link_virtual":    "https://meet.google.com/ejemplo-dia3-2",
        "link_verificado": True,
    },
    {
        "titulo":          "Taller: Detección de Intrusos con Python y ML",
        "descripcion":     "Construye un sistema básico de detección de intrusos usando scikit-learn y análisis de tráfico.",
        "ponente":         "Ing. Raúl Pedraza",
        "afiliacion":      "CyberSec Colombia",
        "track":           SessionTrack.CIBERSEGURIDAD,
        "event_type":      SessionEventType.WORKSHOP,
        "dia":             "2026-10-03",
        "hora_inicio":     "14:00",
        "hora_fin":        "16:00",
        "salon":           "Sala de Cómputo 2",
        "modalidad":       SessionModality.PRESENCIAL,
        "status_logistico":SessionStatus.NORMAL,
        "cupos_totales":   25,
        "link_virtual":    None,
        "link_verificado": False,
    },
    {
        "titulo":          "Clausura: El Futuro de la Ingeniería en IA y Big Data",
        "descripcion":     "Conferencia de cierre con perspectivas globales sobre las profesiones de ingeniería en la próxima década.",
        "ponente":         "Rector Invitado",
        "afiliacion":      "CONIITI 2026",
        "track":           SessionTrack.INNOVACION,
        "event_type":      SessionEventType.CONFERENCE,
        "dia":             "2026-10-03",
        "hora_inicio":     "17:00",
        "hora_fin":        "18:00",
        "salon":           "Auditorio Principal",
        "modalidad":       SessionModality.HIBRIDO,
        "status_logistico":SessionStatus.NORMAL,
        "cupos_totales":   300,
        "link_virtual":    "https://meet.google.com/ejemplo-clausura",
        "link_verificado": False,
    },
]


def main():
    db = SessionLocal()
    try:
        # Borrar todas las sesiones existentes
        deleted = db.query(Session).delete()
        db.commit()
        print(f"🗑️  {deleted} sesiones anteriores eliminadas.\n")

        count = 0
        for data in SESSIONS:
            session = Session(**data)
            db.add(session)
            count += 1
            print(f"  ✓ [{data['dia']} {data['hora_inicio']}] {data['titulo'][:55]}")

        db.commit()
        print(f"\n✅ {count} conferencias creadas exitosamente.")
    except Exception as e:
        db.rollback()
        print(f"\n❌ Error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("🎓 Creando conferencias de ejemplo para CONIITI 2026 (Oct 1-3)...\n")
    main()
