import { FiCheckCircle, FiAlertTriangle, FiClock } from 'react-icons/fi';

import { SESSION_STATUS } from '../types/session';
import { isRecentChange } from '../services/agendaService';
import styles from '../styles/components/StatusBadge.module.css';

export default function StatusBadge({ status, timestamp, salonAnterior }) {
    const recent = isRecentChange(timestamp, 30);
    const { className, icon, label } = getVariant(status, recent);

    return (
        <div>
            <span className={`${styles.badge} ${className}`}>
                <span className={styles.icon}>{icon}</span>
                {label}
            </span>
            {status === SESSION_STATUS.CAMBIO_SALON && salonAnterior && (
                <span className={styles.previousRoom}>
                    Antes: {salonAnterior}
                </span>
            )}
        </div>
    );
}

function getVariant(status, isRecent) {
    switch (status) {
        case SESSION_STATUS.CAMBIO_SALON:
            return {
                className: isRecent ? styles.cambioSalonRecent : styles.cambioSalon,
                icon: <FiAlertTriangle />,
                label: 'Cambio de salón',
            };
        case SESSION_STATUS.RETRASADO:
            return {
                className: styles.retrasado,
                icon: <FiClock />,
                label: 'Retrasado',
            };
        default:
            return {
                className: styles.normal,
                icon: <FiCheckCircle />,
                label: 'Normal',
            };
    }
}
