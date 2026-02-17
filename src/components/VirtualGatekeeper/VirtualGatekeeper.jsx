import { FiExternalLink, FiAlertCircle, FiMapPin } from 'react-icons/fi';
import { SESSION_MODALITY } from '../../types/session';
import styles from './VirtualGatekeeper.module.css';

/**
 * VirtualGatekeeper — controla el acceso al botón "Unirse" basado en la verificación del enlace.
 *
 * - Solo presencial                   → muestra etiqueta "Presencial", sin botón.
 * - Virtual / Híbrido verificado      → botón habilitado
 * - Virtual / Híbrido no verificado   → botón deshabilitado + advertencia
 *
 * @param {{ modalidad: string, linkVirtual: string|null, linkVerificado: boolean }} props
 */
export default function VirtualGatekeeper({ modalidad, linkVirtual, linkVerificado }) {
    // Sesiones solo presenciales no necesitan enlace virtual
    if (modalidad === SESSION_MODALITY.PRESENCIAL) {
        return (
            <div className={styles.presencialNote}>
                <FiMapPin />
                <span>Sesión presencial únicamente</span>
            </div>
        );
    }

    // Virtual / Híbrido con enlace verificado
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

    // Virtual / Híbrido con enlace no verificado o faltante
    return (
        <div className={styles.wrapper}>
            <button className={styles.disabledButton} disabled>
                <FiExternalLink />
                Unirse a la sesión
            </button>
            <div className={styles.warning}>
                <FiAlertCircle className={styles.warningIcon} />
                <span>Enlace en proceso de validación por el staff</span>
            </div>
        </div>
    );
}
