// ============================================================
// Panel del Staff — CONIITI Front-end
// Permite al staff gestionar (CRUD) las sesiones del congreso.
// Conectado al API real. Reemplaza la versión con mockData.
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiCalendar, FiLink, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import {
    getSessions, createSession, updateSession,
    deleteSession, toggleLinkVerified,
} from '../services/agendaService';
import { SESSION_STATUS, SESSION_MODALITY } from '../types/session';
import SessionFormModal from '../components/SessionFormModal';
import CMSPanel from '../components/CMSPanel';
import DocumentManager from '../components/admin/DocumentManager';
import styles from '../styles/pages/StaffDashboard.module.css';

/**
 * StaffDashboard — panel de administración de sesiones del congreso.
 * Solo accesible para usuarios con rol 'staff' o 'superuser'.
 */
export default function StaffDashboard() {
    const [sessions, setSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [sessionToEdit, setSessionToEdit] = useState(null);
    const [activeTab, setActiveTab] = useState('agenda'); // 'agenda' | 'cms' | 'documentos'

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
        if (!window.confirm('¿Eliminar esta sesión? Esta acción no se puede deshacer.')) return;
        try {
            await deleteSession(id);
            setSessions((prev) => prev.filter((s) => s.id !== id));
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    const handleSave = async (data) => {
        try {
            if (sessionToEdit) {
                const updated = await updateSession(sessionToEdit.id, data);
                setSessions((prev) => prev.map((s) => s.id === updated.id ? updated : s));
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
            setSessions((prev) => prev.map((s) => s.id === updated.id ? updated : s));
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

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
            <div className={styles.pageHeader}>
                <h1>Panel de Administración</h1>
                <p>Gestiona la agenda, sesiones del congreso y contenido de la web.</p>
            </div>

            <div className={styles.tabs} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #eee' }}>
                <button 
                    onClick={() => setActiveTab('agenda')} 
                    style={{ padding: '0.8rem 1.5rem', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600, borderBottom: activeTab === 'agenda' ? '3px solid var(--color-primary)' : '3px solid transparent', color: activeTab === 'agenda' ? 'var(--color-primary)' : '#666' }}
                >
                    Gestión de Sesiones (Agenda)
                </button>
                <button 
                    onClick={() => setActiveTab('cms')} 
                    style={{ padding: '0.8rem 1.5rem', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600, borderBottom: activeTab === 'cms' ? '3px solid var(--color-primary)' : '3px solid transparent', color: activeTab === 'cms' ? 'var(--color-primary)' : '#666' }}
                >
                    Gestor de Contenido (CMS)
                </button>
                <button 
                    onClick={() => setActiveTab('documentos')} 
                    style={{ padding: '0.8rem 1.5rem', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600, borderBottom: activeTab === 'documentos' ? '3px solid var(--color-primary)' : '3px solid transparent', color: activeTab === 'documentos' ? 'var(--color-primary)' : '#666' }}
                >
                    Documentos CONIITI
                </button>
            </div>

            {activeTab === 'cms' ? (
                <CMSPanel />
            ) : activeTab === 'documentos' ? (
                <DocumentManager />
            ) : (
                <>
                    <div className={styles.actionBar}>
                        <button className={styles.primaryBtn} onClick={handleNew}>
                            <FiPlus size={16} /> Nueva Sesión
                        </button>
                    </div>

                    {error && <div className={styles.error}>{error}</div>}

            {/* Tabla */}
            <div className={styles.card}>
                <div className={styles.tableWrapper}>
                    {isLoading ? (
                        <div className={styles.loading}>Cargando sesiones...</div>
                    ) : sessions.length === 0 ? (
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
                                {sessions.map((s) => (
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
            </>
            )}

            {/* Modal */}
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
