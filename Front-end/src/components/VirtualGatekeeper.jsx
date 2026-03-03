import { FiExternalLink, FiAlertCircle, FiMapPin, FiLock } from 'react-icons/fi';
import { SESSION_MODALITY } from '../types/session';
import styles from '../styles/components/VirtualGatekeeper.module.css';

/**
 * VirtualGatekeeper — controla el acceso al botón "Unirse".
 *
 * Reglas:
 * - Solo presencial         → etiqueta "Presencial", sin botón de unirse.
 * - Virtual/Híbrido + NO pre-inscrito → botón desactivado + mensaje "Pre-inscríbete primero"
 * - Virtual/Híbrido + pre-inscrito + enlace NO verificado → botón desactivado + advertencia de validación
 * - Virtual/Híbrido + pre-inscrito + enlace verificado    → botón habilitado
 */
export default function VirtualGatekeeper({
    modalidad,
    linkVirtual,
    linkVerificado,
    isRegistered = false,
}) {
    // Sesiones presenciales no tienen enlace virtual
    if (modalidad === SESSION_MODALITY.PRESENCIAL) {
        return (
            <div className={styles.presencialNote}>
                <FiMapPin />
                <span>Sesión presencial únicamente</span>
            </div>
        );
    }

    // Virtual/Híbrido pero el usuario NO está pre-inscrito
    if (!isRegistered) {
        return (
            <div className={styles.wrapper}>
                <button className={styles.disabledButton} disabled>
                    <FiLock size={14} />
                    Unirse a la sesión
                </button>
                <div className={styles.warning}>
                    <FiAlertCircle className={styles.warningIcon} />
                    <span>Pre-inscríbete para acceder al enlace</span>
                </div>
            </div>
        );
    }

    // Pre-inscrito + enlace verificado → acceso habilitado
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

    // Pre-inscrito pero enlace aún no verificado
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
