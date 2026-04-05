import { useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { Link } from 'react-router-dom';

import SpeakerDocuments from './SpeakerDocuments';
import styles from '../styles/components/Speaker.module.css';

export default function SpeakerModal({ speaker, onClose }) {
    useEffect(() => {
        const handler = (event) => {
            if (event.key === 'Escape') onClose();
        };

        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    if (!speaker) return null;

    const { ponente, afiliacion, descripcion_ponente, foto_ponente_url, es_conferencista_principal } = speaker;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar ventana">
                    <FiX size={20} />
                </button>

                <div className={styles.header}>
                    {foto_ponente_url ? (
                        <img
                            src={foto_ponente_url}
                            alt={ponente}
                            className={styles.photo}
                            onError={(event) => { event.target.style.display = 'none'; }}
                        />
                    ) : (
                        <div className={`${styles.photo} ${styles.photoAvatar}`}>
                            {ponente?.charAt(0)?.toUpperCase()}
                        </div>
                    )}

                    <div className={styles.headerInfo}>
                        {es_conferencista_principal && (
                            <span className={styles.badge}>Conferencista principal</span>
                        )}
                        <h2 className={styles.name}>{ponente}</h2>
                        <p className={styles.affiliation}>{afiliacion || 'Ponente invitado'}</p>
                    </div>
                </div>

                <div className={styles.body}>
                    <h3 className={styles.bioTitle}>Sobre el ponente</h3>
                    <p className={styles.bio}>
                        {descripcion_ponente || 'No hay descripci\u00f3n disponible para este ponente.'}
                    </p>

                    <h3 className={styles.bioTitle} style={{ marginTop: '1.5rem' }}>Materiales del ponente</h3>
                    <SpeakerDocuments
                        ponente={ponente}
                        sessionId={null}
                        sessionExists
                        canManage={false}
                        showTitle={false}
                        variant="speakerModal"
                    />

                    <Link to="/conferencistas" onClick={onClose} className={styles.speakerLink}>
                        Ver todos los conferencistas
                    </Link>
                </div>
            </div>
        </div>
    );
}
