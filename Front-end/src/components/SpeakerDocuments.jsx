// SpeakerDocuments.jsx
// Seccion de documentos del ponente dentro del formulario de sesion.

import { useState } from 'react';
import { FiFileText, FiTrash2, FiUploadCloud } from 'react-icons/fi';
import { useSpeakerDocuments } from '../hooks/useDocuments';
import styles from '../styles/components/SpeakerDocuments.module.css';

/**
 * Muestra y gestiona los documentos del ponente de una sesion.
 * Solo activo al editar una sesion existente.
 * @param {{ ponente: string, sessionExists: boolean }} props
 */
export default function SpeakerDocuments({ ponente, sessionExists }) {
    const { documents, loading, addDocument, removeDocument } = useSpeakerDocuments(
        sessionExists ? ponente : null
    );
    const [docFile, setDocFile] = useState(null);
    const [docTitle, setDocTitle] = useState('');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleUpload = async (e) => {
        e.preventDefault();
        setError('');
        if (!docFile) { setError('Selecciona un archivo.'); return; }
        setUploading(true);
        try {
            await addDocument({ file: docFile, titulo: docTitle || docFile.name, ponente });
            setDocFile(null);
            setDocTitle('');
        } catch (err) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Eliminar este documento?')) return;
        try {
            await removeDocument(id);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className={styles.section}>
            <h4 className={styles.title}>
                <FiFileText size={14} /> Documentos del Ponente
            </h4>

            {/* Aviso cuando es sesion nueva */}
            {!sessionExists && (
                <p className={styles.hint}>
                    Guarda la sesion primero para poder adjuntar documentos al ponente.
                </p>
            )}

            {sessionExists && (
                <>
                    {/* Lista de documentos existentes */}
                    {loading && <p className={styles.hint}>Cargando documentos...</p>}

                    {documents.map(doc => (
                        <div key={doc.id} className={styles.docRow}>
                            <FiFileText size={13} className={styles.docIcon} />
                            <a
                                href={doc.file_url}
                                target="_blank"
                                rel="noreferrer"
                                className={styles.docLink}
                            >
                                {doc.titulo}
                            </a>
                            <button className={styles.deleteBtn} onClick={() => handleDelete(doc.id)}>
                                <FiTrash2 size={13} />
                            </button>
                        </div>
                    ))}

                    {/* Formulario de subida */}
                    <div className={styles.uploadArea}>
                        {error && <p className={styles.errorMsg}>{error}</p>}
                        <div className={styles.uploadRow}>
                            <input
                                value={docTitle}
                                onChange={e => setDocTitle(e.target.value)}
                                placeholder="Titulo del documento"
                                className={styles.titleInput}
                            />
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx,.ppt,.pptx"
                                onChange={e => setDocFile(e.target.files[0])}
                                className={styles.fileInput}
                            />
                            <button
                                onClick={handleUpload}
                                disabled={uploading}
                                className={styles.uploadBtn}
                            >
                                <FiUploadCloud size={13} />
                                {uploading ? 'Subiendo...' : 'Adjuntar'}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
