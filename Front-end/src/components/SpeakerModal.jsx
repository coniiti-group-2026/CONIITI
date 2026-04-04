// SpeakerModal.jsx
// Modal de perfil del ponente con documentos descargables.

import { useEffect } from 'react';
import { FiX, FiFileText, FiDownload } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useSpeakerDocuments } from '../hooks/useDocuments';
import styles from '../styles/components/Speaker.module.css';

/**
 * Modal de detalle del conferencista.
 * @param {{ speaker: object, onClose: Function }} props
 */
export default function SpeakerModal({ speaker, onClose }) {
    const { documents, loading } = useSpeakerDocuments(speaker?.ponente);

    // Cierre con tecla Escape
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    if (!speaker) return null;

    const { ponente, afiliacion, descripcion_ponente, foto_ponente_url, es_conferencista_principal } = speaker;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar modal">
                    <FiX size={20} />
                </button>

                {/* Cabecera */}
                <div className={styles.header}>
                    {/* Foto o avatar con inicial */}
                    {foto_ponente_url ? (
                        <img
                            src={foto_ponente_url}
                            alt={ponente}
                            className={styles.photo}
                            onError={e => { e.target.style.display = 'none'; }}
                        />
                    ) : (
                        <div className={`${styles.photo} ${styles.photoAvatar}`}>
                            {ponente?.charAt(0)?.toUpperCase()}
                        </div>
                    )}

                    <div className={styles.headerInfo}>
                        {es_conferencista_principal && (
                            <span className={styles.badge}>Conferencista Principal</span>
                        )}
                        <h2 className={styles.name}>{ponente}</h2>
                        <p className={styles.affiliation}>{afiliacion || 'Ponente Invitado'}</p>
                    </div>
                </div>

                {/* Cuerpo */}
                <div className={styles.body}>
                    {/* Biografia */}
                    <h3 className={styles.bioTitle}>Sobre el ponente</h3>
                    <p className={styles.bio}>
                        {descripcion_ponente || 'No hay descripcion disponible para este ponente.'}
                    </p>

                    {/* Documentos */}
                    <h3 className={styles.bioTitle} style={{ marginTop: '1.5rem' }}>Material del ponente</h3>

                    {loading ? (
                        <p className={styles.docEmpty}>Cargando documentos...</p>
                    ) : documents.length === 0 ? (
                        <p className={styles.docEmpty}>No hay documentos disponibles para este ponente.</p>
                    ) : (
                        <div className={styles.docList}>
                            {documents.map(doc => (
                                <a
                                    key={doc.id}
                                    href={doc.file_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={styles.docItem}
                                >
                                    <FiFileText size={15} className={styles.docIcon} />
                                    <span>{doc.titulo}</span>
                                    <FiDownload size={14} className={styles.docDownload} />
                                </a>
                            ))}
                        </div>
                    )}

                    {/* Enlace a pagina de conferencistas */}
                    <Link to="/conferencistas" onClick={onClose} className={styles.speakerLink}>
                        Ver todos los conferencistas
                    </Link>
                </div>
            </div>
        </div>
    );
}