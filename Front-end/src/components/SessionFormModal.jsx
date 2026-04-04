// SessionFormModal.jsx
// Modal para crear o editar una sesion de agenda.

import { useState, useEffect } from 'react';
import { FiX, FiStar } from 'react-icons/fi';
import SpeakerDocuments from './SpeakerDocuments';
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

/**
 * Modal de formulario de sesion (crear o editar).
 * @param {{ session: object|null, onSave: Function, onClose: Function }} props
 */
export default function SessionFormModal({ session, onSave, onClose }) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    useEffect(() => {
        setForm(session ? { ...EMPTY_FORM, ...session } : EMPTY_FORM);
    }, [session]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    // Sube foto del ponente al files-service
    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploadingPhoto(true);
        try {
            const fd = new FormData();
            fd.append('file', file);
            const res = await fetch('http://localhost/api/files/upload', { method: 'POST', body: fd });
            if (!res.ok) throw new Error('Error subiendo foto');
            const { url } = await res.json();
            setForm(prev => ({ ...prev, foto_ponente_url: `http://localhost${url}` }));
        } catch (err) {
            alert(err.message);
        } finally {
            setUploadingPhoto(false);
        }
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
                    <h2>{session ? 'Editar Sesion' : 'Nueva Sesion'}</h2>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
                        <FiX />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className={styles.modalBody}>
                        <div className={styles.grid}>
                            {/* Titulo */}
                            <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                                <label>Titulo *</label>
                                <input name="titulo" value={form.titulo} onChange={handleChange} required placeholder="Titulo de la conferencia" />
                            </div>

                            {/* Ponente */}
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
                                <textarea name="descripcion_ponente" value={form.descripcion_ponente || ''} onChange={handleChange} placeholder="Pequena biografia del ponente..." />
                            </div>

                            {/* Foto del ponente */}
                            <div className={styles.fieldGroup}>
                                <label>Foto del Ponente</label>
                                <input type="file" accept="image/*" onChange={handlePhotoUpload} />
                                {uploadingPhoto && <small>Subiendo...</small>}
                                {form.foto_ponente_url && (
                                    <img
                                        src={form.foto_ponente_url}
                                        alt="preview"
                                        className={styles.photoPreview}
                                    />
                                )}
                            </div>

                            {/* Conferencista principal */}
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

                            {/* Track */}
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

                            {/* Programacion */}
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
                                    {Object.values(SESSION_MODALITY).map(m => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.fieldGroup}>
                                <label>Estado Logistico</label>
                                <select name="status_logistico" value={form.status_logistico} onChange={handleChange}>
                                    {Object.values(SESSION_STATUS).map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.fieldGroup}>
                                <label>Cupos Totales</label>
                                <input name="cupos_totales" type="number" min="0" value={form.cupos_totales} onChange={handleChange} />
                            </div>

                            <div className={styles.fieldGroup}>
                                <label>Enlace Virtual</label>
                                <input name="link_virtual" value={form.link_virtual || ''} onChange={handleChange} placeholder="webex.com/..." />
                            </div>

                            <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                                <label>Descripcion</label>
                                <textarea name="descripcion" value={form.descripcion || ''} onChange={handleChange} placeholder="Descripcion corta de la sesion..." />
                            </div>
                        </div>

                        {/* Documentos del ponente — componente separado */}
                        <SpeakerDocuments
                            ponente={form.ponente || session?.ponente}
                            sessionExists={!!session}
                        />
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
