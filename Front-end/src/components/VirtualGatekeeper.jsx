import { FiExternalLink, FiAlertCircle, FiMapPin, FiLock } from 'react-icons/fi';

import { SESSION_MODALITY } from '../types/session';
import styles from '../styles/components/VirtualGatekeeper.module.css';

export default function VirtualGatekeeper({
    modalidad,
    linkVirtual,
    linkVerificado,
    isRegistered = false,
}) {
    if (modalidad === SESSION_MODALITY.PRESENCIAL) {
        return (
            <div className={styles.presencialNote}>
                <FiMapPin />
                <span>Sesión presencial únicamente</span>
            </div>
        );
    }

    if (!isRegistered) {
        return (
            <div className={styles.wrapper}>
                <button className={styles.disabledButton} disabled>
                    <FiLock size={14} />
                    Unirse a la sesión
                </button>
                <div className={styles.warning}>
                    <FiAlertCircle className={styles.warningIcon} />
                    <span>Preinscríbete para acceder al enlace</span>
                </div>
            </div>
        );
    }

    if (linkVerificado && linkVirtual) {
        return (
            <div className={styles.wrapper}>
                <a
                    href={linkVirtual}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.joinButton}
                >
                    <FiExternalLink />
                    Unirse a la sesión
                </a>
            </div>
        );
    }

    return (
        <div className={styles.wrapper}>
            <button className={styles.disabledButton} disabled>
                <FiExternalLink />
                Unirse a la sesión
            </button>
            <div className={styles.warning}>
                <FiAlertCircle className={styles.warningIcon} />
                <span>El enlace aún está en proceso de validación.</span>
            </div>
        </div>
    );
}
