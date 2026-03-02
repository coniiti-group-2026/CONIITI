import { useState } from 'react';
import AgendaGrid from '../components/AgendaGrid';
import SpeakerModal from '../components/SpeakerModal';
import { getSpeakerById, getAllSessions } from '../services/agendaService';
import { FiBookmark } from 'react-icons/fi';
import styles from '../styles/pages/MyConferences.module.css';

/**
 * MyConferences — muestra las sesiones en las que el usuario se pre-inscribió.
 * El botón "Validar asistencia" reemplaza a "Pre-inscribirse".
 */
export default function MyConferences({ registeredIds = new Set(), onToggleRegister }) {
    const [selectedSpeakerId, setSelectedSpeakerId] = useState(null);
    const speakerData = selectedSpeakerId ? getSpeakerById(selectedSpeakerId) : null;

    // Filtra todas las sesiones para mostrar solo las pre-inscritas
    const allSessions = getAllSessions();
    const mySessions = allSessions.filter((s) => registeredIds.has(s.id));

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <FiBookmark className={styles.headerIcon} />
                <div>
                    <h1 className={styles.title}>Mis Conferencias</h1>
                    <p className={styles.subtitle}>
                        {mySessions.length === 0
                            ? 'Aún no te has pre-inscrito a ninguna sesión.'
                            : `${mySessions.length} sesión${mySessions.length !== 1 ? 'es' : ''} pre-inscrita${mySessions.length !== 1 ? 's' : ''}`
                        }
                    </p>
                </div>
            </div>

            {mySessions.length === 0 ? (
                <div className={styles.empty}>
                    <FiBookmark size={48} className={styles.emptyIcon} />
                    <p>Ve a la <strong>Agenda</strong> y haz clic en <em>"Pre-inscribirse"</em> en las sesiones que te interesen.</p>
                </div>
            ) : (
                <AgendaGrid
                    sessions={mySessions}
                    isLoading={false}
                    onSpeakerClick={setSelectedSpeakerId}
                    registeredIds={registeredIds}
                    onToggleRegister={onToggleRegister}
                    mode="mis-conferencias"
                />
            )}

            {selectedSpeakerId && speakerData && (
                <SpeakerModal
                    speaker={speakerData}
                    onClose={() => setSelectedSpeakerId(null)}
                />
            )}
        </div>
    );
}
