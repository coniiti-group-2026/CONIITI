import { useEffect, useState } from 'react';
import { FiStar, FiX } from 'react-icons/fi';

import styles from '../styles/components/SessionFormModal.module.css';
import {
    SESSION_EVENT_TYPE,
    SESSION_MODALITY,
    SESSION_STATUS,
    SESSION_TRACK,
} from '../types/session';


const EMPTY_FORM = {
    titulo: '',
    ponente: '',
    afiliacion: '',
    descripcion_ponente: '',
    foto_ponente_url: '',
    es_conferencista_principal: false,
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
    cupos_totales: 0,
};


export default function SessionFormModal({ session, onSave, onClose }) {
    const [form, setForm] = useState(EMPTY_FORM);

    useEffect(() => {
        setForm(session ? { ...EMPTY_FORM, ...session } : EMPTY_FORM);
    }, [session]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...form,
            timestamp_actualizacion: new Date().toISOString(),
        });
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>{session ? 'Editar Sesion' : 'Nueva Sesion'}</h2>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
                        <FiX />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className={styles.modalBody}>
                        <div className={styles.grid}>
                            <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                                <label>Titulo *</label>
                                <input name="titulo" value={form.titulo} onChange={handleChange} required placeholder="Titulo de la conferencia" />
                            </div>

                            <div className={styles.fieldGroup}>
                                <label>Ponente *</label>
                                <input name="ponente" value={form.ponente} onChange={handleChange} required placeholder="Nombre del ponente" />
                            </div>

                            <div className={styles.fieldGroup}>
                                <label>Afiliacion</label>
                                <input name="afiliacion" value={form.afiliacion || ''} onChange={handleChange} placeholder="Universidad / Empresa" />
                            </div>

                            <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                                <label>Descripcion del Ponente</label>
                                <textarea name="descripcion_ponente" value={form.descripcion_ponente || ''} onChange={handleChange} placeholder="Breve biografia del ponente..." />
                            </div>

                            <div className={styles.fieldGroup}>
                                <label>URL de la foto del ponente</label>
                                <input name="foto_ponente_url" value={form.foto_ponente_url || ''} onChange={handleChange} placeholder="https://..." />
                                {form.foto_ponente_url && (
                                    <img src={form.foto_ponente_url} alt="preview" className={styles.photoPreview} />
                                )}
                            </div>

                            <div className={`${styles.fieldGroup} ${styles.checkboxGroup}`}>
                                <input
                                    type="checkbox"
                                    id="es_principal_check"
                                    name="es_conferencista_principal"
                                    checked={!!form.es_conferencista_principal}
                                    onChange={handleChange}
                                />
                                <label htmlFor="es_principal_check" className={styles.checkboxLabel}>
                                    <FiStar size={14} /> Conferencista Principal
                                </label>
                            </div>

                            <div className={styles.fieldGroup}>
                                <label>Track *</label>
                                <select name="track" value={form.track} onChange={handleChange} required>
                                    {Object.values(SESSION_TRACK).map((track) => (
                                        <option key={track} value={track}>{track}</option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.fieldGroup}>
                                <label>Tipo de Evento *</label>
                                <select name="event_type" value={form.event_type} onChange={handleChange} required>
                                    {Object.values(SESSION_EVENT_TYPE).map((eventType) => (
                                        <option key={eventType} value={eventType}>{eventType}</option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.fieldGroup}>
                                <label>Dia *</label>
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
                                <label>Salon *</label>
                                <input name="salon" value={form.salon} onChange={handleChange} required placeholder="Ej: Auditorio A" />
                            </div>

                            <div className={styles.fieldGroup}>
                                <label>Modalidad *</label>
                                <select name="modalidad" value={form.modalidad} onChange={handleChange} required>
                                    {Object.values(SESSION_MODALITY).map((modality) => (
                                        <option key={modality} value={modality}>{modality}</option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.fieldGroup}>
                                <label>Estado Logistico</label>
                                <select name="status_logistico" value={form.status_logistico} onChange={handleChange}>
                                    {Object.values(SESSION_STATUS).map((statusValue) => (
                                        <option key={statusValue} value={statusValue}>{statusValue}</option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.fieldGroup}>
                                <label>Cupos Totales</label>
                                <input name="cupos_totales" type="number" min="0" value={form.cupos_totales} onChange={handleChange} />
                            </div>

                            <div className={styles.fieldGroup}>
                                <label>Enlace Virtual</label>
                                <input name="link_virtual" value={form.link_virtual || ''} onChange={handleChange} placeholder="https://..." />
                            </div>

                            <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                                <label>Descripcion</label>
                                <textarea name="descripcion" value={form.descripcion || ''} onChange={handleChange} placeholder="Descripcion corta de la sesion..." />
                            </div>
                        </div>
                    </div>

                    <div className={styles.modalFooter}>
                        <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancelar</button>
                        <button type="submit" className={styles.saveBtn}>Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
