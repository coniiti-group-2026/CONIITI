import { useEffect, useState } from 'react';
import { FiChevronDown, FiUploadCloud } from 'react-icons/fi';

import { getSessions } from '../../services/agendaService';
import styles from '../../styles/components/DocumentManager.module.css';


const CATEGORIES = [
    { value: 'sistema', label: 'General del congreso' },
    { value: 'ponente', label: 'Material de ponencia' },
];

const EMPTY_FORM = {
    titulo: '',
    descripcion: '',
    category: 'sistema',
    ponente_nombre: '',
    session_id: '',
};

export default function DocumentForm({ onSubmit, onCancel, error }) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [file, setFile] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        getSessions().then(setSessions).catch(() => setSessions([]));
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSessionChange = (event) => {
        const nextSessionId = event.target.value;
        const nextSession = sessions.find((session) => session.id === nextSessionId);

        setForm((prev) => ({
            ...prev,
            session_id: nextSessionId,
            ponente_nombre: nextSession?.ponente ?? '',
            titulo: prev.titulo || (nextSession ? `Material - ${nextSession.ponente}` : ''),
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
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
                session_id: form.category === 'ponente' ? form.session_id : null,
            });
            setForm(EMPTY_FORM);
            setFile(null);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <h4 className={styles.formTitle}>Nuevo documento</h4>

            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.formGrid}>
                <div>
                    <label className={styles.label}>Categoría *</label>
                    <div className={styles.selectWrapper}>
                        <select name="category" className={styles.select} value={form.category} onChange={handleChange}>
                            {CATEGORIES.map((category) => (
                                <option key={category.value} value={category.value}>{category.label}</option>
                            ))}
                        </select>
                        <FiChevronDown size={14} className={styles.selectIcon} />
                    </div>
                </div>

                <div>
                    <label className={styles.label}>Título *</label>
                    <input
                        name="titulo"
                        className={styles.input}
                        value={form.titulo}
                        onChange={handleChange}
                        required
                        placeholder="Nombre del documento"
                    />
                </div>

                {form.category === 'ponente' && (
                    <div className={styles.formGridFull}>
                        <label className={styles.label}>Sesión relacionada *</label>
                        <div className={styles.selectWrapper}>
                            <select className={styles.select} value={form.session_id} onChange={handleSessionChange} required>
                                <option value="">Selecciona la sesión</option>
                                {sessions.map((session) => (
                                    <option key={session.id} value={session.id}>
                                        {session.dia} {session.hora_inicio} - {session.titulo} ({session.ponente})
                                    </option>
                                ))}
                            </select>
                            <FiChevronDown size={14} className={styles.selectIcon} />
                        </div>
                        {form.ponente_nombre && (
                            <p className={styles.hint}>
                                Material asociado a <strong>{form.ponente_nombre}</strong>
                            </p>
                        )}
                    </div>
                )}

                {form.category === 'sistema' && (
                    <div className={styles.formGridFull}>
                        <label className={styles.label}>Descripción</label>
                        <input
                            name="descripcion"
                            className={styles.input}
                            value={form.descripcion}
                            onChange={handleChange}
                            placeholder="Resumen breve"
                        />
                    </div>
                )}

                <div className={styles.formGridFull}>
                    <label className={styles.label}>Archivo *</label>
                    <input
                        type="file"
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg"
                        className={styles.input}
                        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                        required
                    />
                    <p className={styles.hint}>
                        <FiUploadCloud style={{ verticalAlign: 'middle', marginRight: '0.35rem' }} />
                        El archivo quedará disponible para consulta y descarga desde el panel.
                    </p>
                </div>
            </div>

            <div className={styles.formActions}>
                <button type="submit" disabled={submitting} className={styles.btnPrimary}>
                    {submitting ? 'Guardando...' : 'Guardar documento'}
                </button>
                <button type="button" className={styles.btnSecondary} onClick={onCancel}>
                    Cancelar
                </button>
            </div>
        </form>
    );
}
