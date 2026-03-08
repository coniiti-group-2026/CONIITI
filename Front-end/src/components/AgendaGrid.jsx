import { FiCalendar } from 'react-icons/fi';
import SessionCard from './SessionCard';
import styles from '../styles/components/AgendaGrid.module.css';

/**
 * AgendaGrid — renderiza una lista de SessionCards o estados de carga/vacío.
 *
 * @param {{ sessions: import('../types/session').Session[], isLoading: boolean }} props
 */
export default function AgendaGrid({ sessions, isLoading, onSpeakerClick, registeredIds = new Set(), onToggleRegister, mode = 'agenda' }) {
    if (isLoading) {
        return (
            <div className={styles.loadingWrapper}>
                {[1, 2, 3].map((i) => (
                    <div key={i} className={styles.skeleton} />
                ))}
            </div>
        );
    }

    if (sessions.length === 0) {
        return (
            <div className={styles.emptyState}>
                <FiCalendar className={styles.emptyIcon} />
                <h3 className={styles.emptyTitle}>No hay sesiones</h3>
                <p className={styles.emptySubtitle}>
                    No se encontraron sesiones para los filtros seleccionados. Intenta con
                    otro día o modalidad.
                </p>
            </div>
        );
    }

    return (
        <div>
            <div className={styles.countBadge}>
                <FiCalendar size={14} />
                {sessions.length} {sessions.length === 1 ? 'sesión' : 'sesiones'}
            </div>

            <div className={styles.grid}>
                {[...sessions]
                    .sort((a, b) => {
                        if (a.hora_inicio < b.hora_inicio) return -1;
                        if (a.hora_inicio > b.hora_inicio) return 1;
                        return 0;
                    })
                    .map((session, index) => (
                    <SessionCard
                        key={session.id}
                        session={session}
                        index={index}
                        onSpeakerClick={onSpeakerClick}
                        isRegistered={registeredIds.has(session.id)}
                        onToggleRegister={onToggleRegister}
                        mode={mode}
                    />
                ))}
            </div>
        </div>
    );
}
