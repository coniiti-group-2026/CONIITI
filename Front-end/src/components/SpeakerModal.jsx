import { useEffect } from 'react';
import { FiX, FiBriefcase } from 'react-icons/fi';
import styles from '../styles/components/Speaker.module.css';

export default function SpeakerModal({ speaker, onClose }) {
    // para cerrar con escape
    useEffect(() => {
        const handler = (e) => { if (e.key == 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    if (!speaker) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}>
                    <FiX size={20} />
                </button>

                <div className={styles.header}>
                    <img
                        src={'https://i.pravatar.cc/300?u=' + speaker.id}
                        alt={speaker.ponente}
                        className={styles.photo}
                        onError={(e) => { e.target.src = 'https://i.pravatar.cc/300?u=fallback'; }}
                    />

                    <div className={styles.headerInfo}>
                        <h2 className={styles.name}>{speaker.ponente}</h2>
                        <p className={styles.role}>
                            <FiBriefcase size={14} /> Especialista
                        </p>

                        <p className={styles.affiliation}>{speaker.afiliacion || 'Ponente'}</p>
                    </div>
                </div>

                <div className={styles.body}>
                    <h3 className={styles.bioTitle}>Sobre el ponente</h3>
                    <p className={styles.bio}>{speaker.descripcion_ponente || 'No hay descripción disponible para este ponente.'}</p>
                </div>
            </div>
        </div>
    );
}