import { useState } from 'react';
import LiveFilter from '../components/LiveFilter';
import AgendaGrid from '../components/AgendaGrid';
import SpeakerModal from '../components/SpeakerModal';
import { useAgenda } from '../hooks/useAgenda';
import { usePolling } from '../hooks/usePolling';
import { getSpeakerById } from '../services/agendaService';
import styles from '../styles/App.module.css';

/**
 * Agenda — página de agenda del congreso.
 * Navbar y Footer son manejados por App.jsx.
 */
export default function Agenda({ registeredIds = new Set(), onToggleRegister }) {
    const [selectedSpeakerId, setSelectedSpeakerId] = useState(null);
    const speakerData = selectedSpeakerId ? getSpeakerById(selectedSpeakerId) : null;

    const {
        searchQuery, setSearchQuery,
        activeEventType, setActiveEventType,
        sessions, days, activeDay, activeModality,
        isLoading, setActiveDay, setActiveModality, refresh,
    } = useAgenda();

    // Polling cada 60 segundos 
    usePolling(refresh, 60_000);

    return (
        <div className={styles.main}>
            {/* Indicador de sincronización */}
            <div className={styles.pollingBar}>
                <span className={styles.pollingDot} />
                Sincronización automática activa — cada 60 segundos
            </div>

            <LiveFilter
                days={days}
                activeDay={activeDay}
                activeModality={activeModality}
                activeEventType={activeEventType}
                searchQuery={searchQuery}
                onDayChange={setActiveDay}
                onModalityChange={setActiveModality}
                onEventTypeChange={setActiveEventType}
                onSearchQueryChange={setSearchQuery}
            />

            <AgendaGrid
                sessions={sessions}
                isLoading={isLoading}
                onSpeakerClick={setSelectedSpeakerId}
                registeredIds={registeredIds}
                onToggleRegister={onToggleRegister}
            />

            {selectedSpeakerId && speakerData && (
                <SpeakerModal
                    speaker={speakerData}
                    onClose={() => setSelectedSpeakerId(null)}
                />
            )}
        </div>
    );
}
