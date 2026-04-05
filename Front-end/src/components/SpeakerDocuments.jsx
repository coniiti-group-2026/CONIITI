import { useState } from 'react';
import { FiDownload, FiFileText, FiTrash2, FiUploadCloud } from 'react-icons/fi';

import { useSpeakerDocuments } from '../hooks/useDocuments';
import styles from '../styles/components/SpeakerDocuments.module.css';

export default function SpeakerDocuments({
    ponente,
    sessionId,
    sessionExists,
    canManage = true,
    showTitle = true,
    variant = 'default',
}) {
    const { documents, loading, addDocument, removeDocument } = useSpeakerDocuments({
        speakerName: sessionExists ? ponente : null,
        sessionId: sessionExists ? sessionId : null,
    });
    const [docFile, setDocFile] = useState(null);
    const [docTitle, setDocTitle] = useState('');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const isSpeakerModal = variant === 'speakerModal';

    const handleUpload = async (event) => {
        event.preventDefault();
        setError('');

        if (!docFile) {
            setError('Selecciona un archivo.');
            return;
        }

        setUploading(true);
        try {
            await addDocument({
                file: docFile,
                titulo: docTitle || docFile.name,
                ponente,
                session_id: sessionId,
            });
            setDocFile(null);
            setDocTitle('');
        } catch (err) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (documentId) => {
        if (!window.confirm('\u00bfEliminar este documento del ponente?')) return;

        try {
            await removeDocument(documentId);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className={`${styles.section} ${isSpeakerModal ? styles.speakerModalSection : ''}`}>
            {showTitle && (
                <h4 className={styles.title}>
                    <FiFileText size={14} /> Materiales del ponente
                </h4>
            )}

            {!sessionExists && (
                <p className={`${styles.hint} ${isSpeakerModal ? styles.speakerModalHint : ''}`}>
                    Guarda primero la sesi\u00f3n para poder adjuntar materiales al ponente.
                </p>
            )}

            {sessionExists && (
                <>
                    {loading && (
                        <p className={`${styles.hint} ${isSpeakerModal ? styles.speakerModalHint : ''}`}>
                            Cargando documentos...
                        </p>
                    )}

                    {!loading && documents.length === 0 && (
                        <p className={`${styles.hint} ${isSpeakerModal ? styles.speakerModalHint : ''}`}>
                            A\u00fan no hay materiales cargados para este ponente.
                        </p>
                    )}

                    <div className={styles.docList}>
                        {documents.map((doc) => (
                            <div
                                key={doc.id}
                                className={`${styles.docRow} ${isSpeakerModal ? styles.speakerModalDocRow : ''}`}
                            >
                                <FiFileText
                                    size={13}
                                    className={`${styles.docIcon} ${isSpeakerModal ? styles.speakerModalDocIcon : ''}`}
                                />
                                <a href={doc.file_url} target="_blank" rel="noreferrer" className={styles.docLink}>
                                    <span className={isSpeakerModal ? styles.speakerModalDocLink : ''}>
                                        {doc.titulo}
                                    </span>
                                </a>
                                <a
                                    href={doc.file_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={`${styles.deleteBtn} ${isSpeakerModal ? styles.speakerModalActionBtn : ''}`}
                                    title="Abrir documento"
                                >
                                    <FiDownload size={13} />
                                </a>
                                {canManage && (
                                    <button
                                        type="button"
                                        className={`${styles.deleteBtn} ${isSpeakerModal ? styles.speakerModalActionBtn : ''}`}
                                        onClick={() => handleDelete(doc.id)}
                                        title="Eliminar documento"
                                    >
                                        <FiTrash2 size={13} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {canManage && (
                        <div className={styles.uploadArea}>
                            {error && <p className={styles.errorMsg}>{error}</p>}
                            <div className={styles.uploadRow}>
                                <input
                                    value={docTitle}
                                    onChange={(event) => setDocTitle(event.target.value)}
                                    placeholder="T\u00edtulo del material"
                                    className={styles.titleInput}
                                />
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                                    onChange={(event) => setDocFile(event.target.files?.[0] ?? null)}
                                    className={styles.fileInput}
                                />
                                <button
                                    type="button"
                                    onClick={handleUpload}
                                    disabled={uploading}
                                    className={styles.uploadBtn}
                                >
                                    <FiUploadCloud size={13} />
                                    {uploading ? 'Subiendo...' : 'Adjuntar'}
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
