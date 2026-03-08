import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import styles from '../styles/components/SessionFormModal.module.css';
import {
    SESSION_STATUS,
    SESSION_MODALITY,
    SESSION_TRACK,
    SESSION_EVENT_TYPE,
} from '../types/session';

const EMPTY_FORM = {
    titulo: '',
    ponente: '',
    afiliacion: '',
    track: SESSION_TRACK.IA,
    event_type: SESSION_EVENT_TYPE.CONFERENCE,
    dia: '',
    hora_inicio: '',
    hora_fin: '',
    salon: '',
    salon_anterior: '',
    modalidad: SESSION_MODALITY.PRESENCIAL,
    status_logistico: SESSION_STATUS.NORMAL,
    link_virtual: '',
    link_verificado: false,
    descripcion: '',
    descripcion_ponente: '',
};

/**
 * SessionFormModal — Modal para crear o editar una sesión.
 * @param {{ session: object|null, onSave: Function, onClose: Function }} props
 */
export default function SessionFormModal({ session, onSave, onClose }) {
    const [form, setForm] = useState(EMPTY_FORM);

    useEffect(() => {
        setForm(session ? { ...EMPTY_FORM, ...session } : EMPTY_FORM);
    }, [session]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...form,
            id: session?.id ?? `ses-${Date.now()}`,
            timestamp_actualizacion: new Date().toISOString(),
        });
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                {/* Encabezado */}
                <div className={styles.modalHeader}>
                    <h2>{session ? 'Editar Sesión' : 'Nueva Sesión'}</h2>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
                        <FiX />
                    </button>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit}>
                    <div className={styles.modalBody}>
                        <div className={styles.grid}>
                            <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                                <label>Título *</label>
                                <input name="titulo" value={form.titulo} onChange={handleChange} required placeholder="Título de la conferencia" />
                            </div>

                            <div className={styles.fieldGroup}>
                                <label>Ponente *</label>
                                <input name="ponente" value={form.ponente} onChange={handleChange} required placeholder="Nombre del ponente" />
                            </div>

                            <div className={styles.fieldGroup}>
                                <label>Afiliación</label>
                                <input name="afiliacion" value={form.afiliacion || ''} onChange={handleChange} placeholder="Universidad / Empresa" />
                            </div>

                            <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                                <label>Descripción del Ponente</label>
                                <textarea name="descripcion_ponente" value={form.descripcion_ponente || ''} onChange={handleChange} placeholder="Pequeña biografía del ponente..." />
                            </div>

                            <div className={styles.fieldGroup}>
                                <label>Track *</label>
                                <select name="track" value={form.track} onChange={handleChange} required>
                                    {Object.values(SESSION_TRACK).map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.fieldGroup}>
                                <label>Tipo de Evento *</label>
                                <select name="event_type" value={form.event_type} onChange={handleChange} required>
                                    {Object.values(SESSION_EVENT_TYPE).map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.fieldGroup}>
                                <label>Día *</label>
                                <input name="dia" type="date" value={form.dia} onChange={handleChange} required />
                            </div>

                            <div className={styles.fieldGroup}>
                                <label>Hora Inicio *</label>
                                <input name="hora_inicio" type="time" value={form.hora_inicio} onChange={handleChange} required />
                            </div>

                            <div className={styles.fieldGroup}>
                                <label>Hora Fin *</label>
                                <input name="hora_fin" type="time" value={form.hora_fin} onChange={handleChange} required />
                            </div>

                            <div className={styles.fieldGroup}>
                                <label>Salón *</label>
                                <input name="salon" value={form.salon} onChange={handleChange} required placeholder="Ej: Auditorio A" />
                            </div>

                            <div className={styles.fieldGroup}>
                                <label>Modalidad *</label>
                                <select name="modalidad" value={form.modalidad} onChange={handleChange} required>
                                    {Object.values(SESSION_MODALITY).map(m => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.fieldGroup}>
                                <label>Estado Logístico</label>
                                <select name="status_logistico" value={form.status_logistico} onChange={handleChange}>
                                    {Object.values(SESSION_STATUS).map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.fieldGroup}>
                                <label>Enlace Virtual</label>
                                <input name="link_virtual" value={form.link_virtual} onChange={handleChange} placeholder="webex." />
                            </div>

                            <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                                <label>Descripción</label>
                                <textarea name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="Descripción corta de la sesión..." />
                            </div>
                        </div>
                    </div>

                    {/* Pie del modal */}
                    <div className={styles.modalFooter}>
                        <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancelar</button>
                        <button type="submit" className={styles.saveBtn}>Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
