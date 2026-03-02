import { useEffect } from 'react';
import { FiX, FiMapPin, FiBriefcase } from 'react-icons/fi';
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
                        src={speaker.photo_url}
                        alt={speaker.name}
                        className={styles.photo}
                        onError={(e) => { e.target.src = 'https://i.pravatar.cc/300?u=fallback'; }}
                    />

                    <div className={styles.headerInfo}>
                        <h2 className={styles.name}>{speaker.name}</h2>
                        <p className={styles.role}>
                            <FiBriefcase size={14} /> {speaker.role}
                        </p>

                        <p className={styles.affiliation}>{speaker.affiliation}</p>
                        <p className={styles.country}>
                            <FiMapPin size={13} /> {speaker.country}
                        </p>
                    </div>
                </div>

                <div className={styles.body}>
                    <h3 className={styles.bioTitle}>Sobre el ponente</h3>
                    <p className={styles.bio}>{speaker.bio}</p>
                </div>
            </div>
        </div>
    );
}