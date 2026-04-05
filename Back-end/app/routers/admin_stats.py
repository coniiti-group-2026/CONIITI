from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, distinct, desc
from typing import Dict, Any

from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.session import Session as EventSession, session_registrations
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/admin", tags=["Administración del Sistema"])

def get_current_superuser(current_user = Depends(get_current_user)):
    """Dependencia que valida el acceso exclusivo para Superusuarios"""
    if current_user.role != UserRole.SUPERUSER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Acceso denegado. Se requiere rol de Superusuario."
        )
    return current_user

@router.get("/dashboard-stats", response_model=Dict[str, Any])
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_superuser)
):
    """
    Retorna métricas globales calculadas nativamente desde PostgreSQL 
    para alimentar el Dashboard del Superusuario.
    """
    
    # 1. ESTADÍSTICAS DE USUARIOS
    total_users = db.query(User).count()
    
    # Pre-inscritos (No tienen OTP validado / correo no verificado)
    users_unverified = db.query(User).filter(User.is_verified == False).count()
    
    # Subconsulta para saber cuántos usuarios tienen al menos 1 inscripción
    users_with_registration_query = db.query(session_registrations.c.user_id).distinct()
    
    # Confirmados: Están verificados Y tienen al menos 1 sesión inscrita
    users_confirmed = db.query(User).filter(
        User.is_verified == True,
        User.id.in_(users_with_registration_query)
    ).count()
    
    # Validados: Están verificados PERO no tienen sesiones inscritas (Navegando)
    users_validated = db.query(User).filter(
        User.is_verified == True,
        User.id.notin_(users_with_registration_query)
    ).count()

    # 2. ESTADÍSTICAS DE SESIONES Y CUPOS GLOBALES
    total_sessions = db.query(EventSession).count()
    total_capacity = db.query(func.sum(EventSession.cupos_totales)).scalar() or 0
    total_registrations = db.query(session_registrations).count()
    
    # Cantidad de Ponentes (Únicos)
    total_speakers = db.query(func.count(distinct(EventSession.ponente))).scalar() or 0

    # 3. TOP PONENTES (Por mayor cantidad de asistentes)
    # Hacemos COUNT sobre session_registrations, agrupando por id de sesión y ponente
    top_speakers_query = (
        db.query(
            EventSession.ponente,
            func.count(session_registrations.c.user_id).label("attendance")
        )
        .outerjoin(session_registrations, session_registrations.c.session_id == EventSession.id)
        .group_by(EventSession.ponente)
        .order_by(desc("attendance"))
        .limit(5)
        .all()
    )
    
    top_speakers = [{"ponente": row.ponente, "asistentes": row.attendance} for row in top_speakers_query]

    # Retorno unificado
    return {
        "usuarios": {
            "total": total_users,
            "preinscritos_noverificados": users_unverified,
            "validados_sin_cupo": users_validated,
            "confirmados_con_cupos": users_confirmed
        },
        "sesiones": {
            "total": total_sessions,
            "cupos_totales_ofrecidos": total_capacity,
            "inscripciones_realizadas": total_registrations
        },
        "ponentes": {
            "total_unicos": total_speakers,
            "top_asistencia": top_speakers
        }
    }
