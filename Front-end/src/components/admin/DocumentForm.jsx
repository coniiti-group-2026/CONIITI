// DocumentForm.jsx
// Formulario de subida de un nuevo documento CONIITI.

import { useState, useEffect } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import { getSessions } from '../../services/agendaService';
import styles from '../../styles/components/DocumentManager.module.css';

const CATEGORIES = [
    { value: 'sistema', label: 'Sistema / Congreso' },
    { value: 'ponente', label: 'Ponente / Sesion' },
];

const EMPTY = {
    titulo: '',
    descripcion: '',
    category: 'sistema',
    ponente_nombre: '',
    session_id: '',
};

/**
 * Formulario para crear un documento.
 * @param {{ onSubmit: Function, onCancel: Function, error: string }} props
 */
export default function DocumentForm({ onSubmit, onCancel, error }) {
    const [form, setForm] = useState(EMPTY);
    const [file, setFile] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    // Carga sesiones para el selector de ponente
    useEffect(() => {
        getSessions().then(setSessions).catch(() => setSessions([]));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    };

    // Auto-rellena campos al seleccionar sesion
    const handleSessionChange = (e) => {
        const sessionId = e.target.value;
        const session = sessions.find(s => s.id === sessionId);
        setForm(f => ({
            ...f,
            session_id: sessionId,
            ponente_nombre: session?.ponente ?? '',
            titulo: f.titulo || (session ? `Material — ${session.ponente}` : ''),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return;
        if (form.category === 'ponente' && !form.ponente_nombre) return;
        setSubmitting(true);
        try {
            await onSubmit({
                file,
                titulo: form.titulo,
                descripcion: form.descripcion,
                category: form.category,
                ponente_nombre: form.category === 'ponente' ? form.ponente_nombre : null,
            });
            setForm(EMPTY);
            setFile(null);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <h4 className={styles.formTitle}>Nuevo Documento</h4>

            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.formGrid}>
                {/* Categoria */}
                <div>
                    <label className={styles.label}>Categoria *</label>
                    <div className={styles.selectWrapper}>
                        <select
                            name="category"
                            className={styles.select}
                            value={form.category}
                            onChange={handleChange}
                        >
                            {CATEGORIES.map(c => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                        </select>
                        <FiChevronDown size={14} className={styles.selectIcon} />
                    </div>
                </div>

                {/* Titulo */}
                <div>
                    <label className={styles.label}>Titulo del Documento *</label>
                    <input
                        name="titulo"
                        className={styles.input}
                        value={form.titulo}
                        onChange={handleChange}
                        required
                        placeholder="Nombre del archivo"
                    />
                </div>

                {/* Selector de sesion (solo si categoria = ponente) */}
                {form.category === 'ponente' && (
                    <div className={styles.formGridFull}>
                        <label className={styles.label}>Sesion del Ponente *</label>
                        <div className={styles.selectWrapper}>
                            <select
                                className={styles.select}
                                value={form.session_id}
                                onChange={handleSessionChange}
                                required
                            >
                                <option value="">Selecciona la sesion</option>
                                {sessions.map(s => (
                                    <option key={s.id} value={s.id}>
                                        {s.dia} {s.hora_inicio} — {s.titulo} ({s.ponente})
                                    </option>
                                ))}
                            </select>
                            <FiChevronDown size={14} className={styles.selectIcon} />
                        </div>
                        {form.ponente_nombre && (
                            <p className={styles.hint}>
                                Ponente: <strong>{form.ponente_nombre}</strong>
                            </p>
                        )}
                    </div>
                )}

                {/* Descripcion (solo sistema) */}
                {form.category === 'sistema' && (
                    <div className={styles.formGridFull}>
                        <label className={styles.label}>Descripcion</label>
                        <input
                            name="descripcion"
                            className={styles.input}
                            value={form.descripcion}
                            onChange={handleChange}
                            placeholder="Descripcion breve"
                        />
                    </div>
                )}

                {/* Archivo */}
                <div className={styles.formGridFull}>
                    <label className={styles.label}>Archivo *</label>
                    <input
                        type="file"
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                        className={styles.input}
                        onChange={e => setFile(e.target.files[0])}
                        required
                    />
                </div>
            </div>

            <div className={styles.formActions}>
                <button type="submit" disabled={submitting} className={styles.btnPrimary}>
                    {submitting ? 'Subiendo...' : 'Guardar Documento'}
                </button>
                <button type="button" className={styles.btnSecondary} onClick={onCancel}>
                    Cancelar
                </button>
            </div>
        </form>
    );
}
