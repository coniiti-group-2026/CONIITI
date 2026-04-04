import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiCalendar, FiLink, FiCheckCircle, FiXCircle, FiTrendingUp } from 'react-icons/fi';

import {
    getSessions,
    createSession,
    updateSession,
    deleteSession,
    toggleLinkVerified,
} from '../services/agendaService';
import SessionFormModal from '../components/SessionFormModal';
import { useAuth } from '../context/AuthContext';
import { SESSION_MODALITY, SESSION_STATUS } from '../types/session';
import styles from '../styles/pages/StaffDashboard.module.css';


export default function StaffDashboard() {
    const { user } = useAuth();
    const isSuperuser = user && user.role === 'superuser';

    const [sessions, setSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [sessionToEdit, setSessionToEdit] = useState(null);

    const fetchSessions = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const data = await getSessions();
            setSessions(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

    const handleNew = () => {
        setSessionToEdit(null);
        setModalOpen(true);
    };

    const handleEdit = (session) => {
        setSessionToEdit(session);
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Eliminar esta sesion? Esta accion no se puede deshacer.')) return;
        try {
            await deleteSession(id);
            setSessions((prev) => prev.filter((session) => session.id !== id));
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    const handleSave = async (data) => {
        try {
            if (sessionToEdit) {
                const updated = await updateSession(sessionToEdit.id, data);
                setSessions((prev) => prev.map((session) => (session.id === updated.id ? updated : session)));
            } else {
                const created = await createSession(data);
                setSessions((prev) => [created, ...prev]);
            }
            setModalOpen(false);
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    const handleToggleVerificado = async (id) => {
        try {
            const updated = await toggleLinkVerified(id);
            setSessions((prev) => prev.map((session) => (session.id === updated.id ? updated : session)));
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    const statusClass = (status) => {
        if (status === SESSION_STATUS.CAMBIO_SALON) return styles.badgeCambio;
        if (status === SESSION_STATUS.RETRASADO) return styles.badgeRetrasado;
        return styles.badgeNormal;
    };

    const modalityClass = (modality) => {
        if (modality === SESSION_MODALITY.VIRTUAL) return styles.badgeVirtual;
        if (modality === SESSION_MODALITY.HIBRIDO) return styles.badgeHibrido;
        return styles.badgePresencial;
    };

    const formatDay = (iso) => {
        if (!iso) return '-';
        const [year, month, day] = iso.split('-');
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        return `${parseInt(day, 10)} ${months[parseInt(month, 10) - 1]} ${year}`;
    };

    return (
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <h1>Panel de Administracion</h1>
                <p>Gestiona la agenda y las sesiones del congreso desde los microservicios principales.</p>
            </div>

            <div className={styles.tabs} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #eee' }}>
                <button
                    onClick={() => undefined}
                    style={{
                        padding: '0.8rem 1.5rem',
                        border: 'none',
                        background: 'none',
                        cursor: 'default',
                        fontWeight: 600,
                        borderBottom: '3px solid var(--color-primary)',
                        color: 'var(--color-primary)',
                    }}
                >
                    Gestion de Sesiones (Agenda)
                </button>
                {isSuperuser && (
                    <div style={{ marginLeft: 'auto', padding: '0.8rem 0', color: '#666', fontWeight: 600 }}>
                        <FiTrendingUp style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />
                        Supervision activa de agenda
                    </div>
                )}
            </div>

            <div className={styles.actionBar}>
                <button className={styles.primaryBtn} onClick={handleNew}>
                    <FiPlus size={16} /> Nueva Sesion
                </button>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.card}>
                <div className={styles.tableWrapper}>
                    {isLoading ? (
                        <div className={styles.loading}>Cargando sesiones...</div>
                    ) : sessions.length === 0 ? (
                        <div className={styles.empty}>
                            <FiCalendar size={40} opacity={0.3} />
                            <p>No hay sesiones registradas. Crea la primera.</p>
                        </div>
                    ) : (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Titulo</th>
                                    <th>Ponente</th>
                                    <th>Dia</th>
                                    <th>Hora</th>
                                    <th>Salon</th>
                                    <th>Modalidad</th>
                                    <th>Estado</th>
                                    <th>Enlace Virtual</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sessions.map((session) => (
                                    <tr key={session.id}>
                                        <td><strong>{session.titulo}</strong></td>
                                        <td>{session.ponente}</td>
                                        <td>{formatDay(session.dia)}</td>
                                        <td>{session.hora_inicio} - {session.hora_fin}</td>
                                        <td>{session.salon}</td>
                                        <td>
                                            <span className={`${styles.badge} ${modalityClass(session.modalidad)}`}>
                                                {session.modalidad}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`${styles.badge} ${statusClass(session.status_logistico)}`}>
                                                {session.status_logistico}
                                            </span>
                                        </td>
                                        <td>
                                            {session.modalidad !== 'Presencial' ? (
                                                <div className={styles.linkCell}>
                                                    {session.link_virtual ? (
                                                        <>
                                                            <button
                                                                className={session.link_verificado ? styles.verifiedBtn : styles.unverifiedBtn}
                                                                onClick={() => handleToggleVerificado(session.id)}
                                                                title={session.link_verificado ? 'Marcar como no verificado' : 'Marcar como verificado'}
                                                            >
                                                                {session.link_verificado ? <><FiCheckCircle size={13} /> Verificado</> : <><FiXCircle size={13} /> Sin verificar</>}
                                                            </button>
                                                            <a
                                                                href={session.link_virtual}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className={styles.linkUrl}
                                                                title={session.link_virtual}
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
                                                <button className={styles.editBtn} onClick={() => handleEdit(session)} title="Editar sesion">
                                                    <FiEdit2 size={13} /> Editar
                                                </button>
                                                <button className={styles.deleteBtn} onClick={() => handleDelete(session.id)} title="Eliminar sesion">
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
                    {sessions.length} {sessions.length === 1 ? 'sesion' : 'sesiones'} en total
                </div>
            </div>

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
