import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiCalendar, FiLink, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import styles from '../styles/pages/StaffDashboard.module.css';
import SessionFormModal from '../components/SessionFormModal';
import { getAllSessions } from '../services/agendaService';
import { SESSION_STATUS, SESSION_MODALITY } from '../types/session';

/**
 * StaffDashboard — Panel de administración de sesiones para el Staff.
 * CRUD completo con estado local (mock) hasta integrar el backend.
 */
export default function StaffDashboard() {
    const [sessions, setSessions] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [sessionToEdit, setSessionToEdit] = useState(null);

    // Cargar sesiones mock al montar
    useEffect(() => {
        setSessions(getAllSessions());
    }, []);

    // ── CRUD handlers ──
    const handleNew = () => {
        setSessionToEdit(null);
        setModalOpen(true);
    };

    const handleEdit = (session) => {
        setSessionToEdit(session);
        setModalOpen(true);
    };

    const handleDelete = (id) => {
        if (!window.confirm('¿Eliminar esta sesión? Esta acción no se puede deshacer.')) return;
        setSessions(prev => prev.filter(s => s.id !== id));
    };

    const handleSave = (data) => {
        setSessions(prev => {
            const exists = prev.some(s => s.id === data.id);
            return exists
                ? prev.map(s => s.id === data.id ? data : s)
                : [data, ...prev];
        });
        setModalOpen(false);
    };

    // Verificar / desverificar el enlace virtual de una sesión
    const handleToggleVerificado = (id) => {
        setSessions(prev =>
            prev.map(s =>
                s.id === id
                    ? { ...s, link_verificado: !s.link_verificado, timestamp_actualizacion: new Date().toISOString() }
                    : s
            )
        );
    };

    // ── Helpers de badge ──
    const statusClass = (status) => {
        if (status === SESSION_STATUS.CAMBIO_SALON) return styles.badgeCambio;
        if (status === SESSION_STATUS.RETRASADO) return styles.badgeRetrasado;
        return styles.badgeNormal;
    };

    const modalityClass = (mod) => {
        if (mod === SESSION_MODALITY.VIRTUAL) return styles.badgeVirtual;
        if (mod === SESSION_MODALITY.HIBRIDO) return styles.badgeHibrido;
        return styles.badgePresencial;
    };

    const formatDay = (iso) => {
        if (!iso) return '—';
        const [year, month, day] = iso.split('-');
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        return `${parseInt(day)} ${months[parseInt(month) - 1]} ${year}`;
    };

    return (
        <div className={styles.page}>
            {/* ── Encabezado ── */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <h1>Panel de Staff</h1>
                    <p>Gestión de sesiones y conferencias — CONIITI 2026 v1</p>
                </div>
                <button className={styles.newBtn} onClick={handleNew}>
                    <FiPlus size={16} />
                    Nueva Conferencia
                </button>
            </div>

            {/* ── Tabla ── */}
            <div className={styles.card}>
                <div className={styles.tableWrapper}>
                    {sessions.length === 0 ? (
                        <div className={styles.empty}>
                            <FiCalendar size={40} opacity={0.3} />
                            <p>No hay sesiones registradas. ¡Crea la primera!</p>
                        </div>
                    ) : (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Título</th>
                                    <th>Ponente</th>
                                    <th>Día</th>
                                    <th>Hora</th>
                                    <th>Salón</th>
                                    <th>Modalidad</th>
                                    <th>Estado</th>
                                    <th>Enlace Virtual</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sessions.map(s => (
                                    <tr key={s.id}>
                                        <td><strong>{s.titulo}</strong></td>
                                        <td>{s.ponente}</td>
                                        <td>{formatDay(s.dia)}</td>
                                        <td>{s.hora_inicio} – {s.hora_fin}</td>
                                        <td>{s.salon}</td>
                                        <td>
                                            <span className={`${styles.badge} ${modalityClass(s.modalidad)}`}>
                                                {s.modalidad}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`${styles.badge} ${statusClass(s.status_logistico)}`}>
                                                {s.status_logistico}
                                            </span>
                                        </td>
                                        <td>
                                            {/* Celda de enlace virtual: solo aplica para virtual/híbrido */}
                                            {s.modalidad !== 'Presencial' ? (
                                                <div className={styles.linkCell}>
                                                    {s.link_virtual ? (
                                                        <>
                                                            <button
                                                                className={s.link_verificado ? styles.verifiedBtn : styles.unverifiedBtn}
                                                                onClick={() => handleToggleVerificado(s.id)}
                                                                title={s.link_verificado ? 'Marcar como no verificado' : 'Marcar como verificado'}
                                                            >
                                                                {s.link_verificado
                                                                    ? <><FiCheckCircle size={13} /> Verificado</>
                                                                    : <><FiXCircle size={13} /> Sin verificar</>
                                                                }
                                                            </button>
                                                            <a
                                                                href={s.link_virtual}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className={styles.linkUrl}
                                                                title={s.link_virtual}
                                                            >
                                                                <FiLink size={12} /> Ver enlace
                                                            </a>
                                                        </>
                                                    ) : (
                                                        <span className={styles.noLink}>Sin enlace</span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className={styles.presencialBadge}>Presencial</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className={styles.actions}>
                                                <button
                                                    className={styles.editBtn}
                                                    onClick={() => handleEdit(s)}
                                                    title="Editar sesión"
                                                >
                                                    <FiEdit2 size={13} /> Editar
                                                </button>
                                                <button
                                                    className={styles.deleteBtn}
                                                    onClick={() => handleDelete(s.id)}
                                                    title="Eliminar sesión"
                                                >
                                                    <FiTrash2 size={13} /> Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                <div className={styles.count}>
                    {sessions.length} {sessions.length === 1 ? 'sesión' : 'sesiones'} en total
                </div>
            </div>

            {/* ── Modal ── */}
            {modalOpen && (
                <SessionFormModal
                    session={sessionToEdit}
                    onSave={handleSave}
                    onClose={() => setModalOpen(false)}
                />
            )}
        </div>
    );
}
