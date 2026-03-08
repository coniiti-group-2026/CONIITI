import { useState } from 'react';
import LiveFilter from '../components/LiveFilter';
import AgendaGrid from '../components/AgendaGrid';
import SpeakerModal from '../components/SpeakerModal';
import { useAgenda } from '../hooks/useAgenda';
import { usePolling } from '../hooks/usePolling';
// No se requiere getSpeakerById
import styles from '../styles/App.module.css';

/**
 * Agenda — página de agenda del congreso.
 * Navbar y Footer son manejados por App.jsx.
 */
export default function Agenda({ registeredIds = new Set(), onToggleRegister }) {
    const [selectedSpeaker, setSelectedSpeaker] = useState(null);

    const {
        searchQuery, setSearchQuery,
        activeEventType, setActiveEventType,
        activeRoom, setActiveRoom,
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
                activeRoom={activeRoom}
                searchQuery={searchQuery}
                onDayChange={setActiveDay}
                onModalityChange={setActiveModality}
                onEventTypeChange={setActiveEventType}
                onRoomChange={setActiveRoom}
                onSearchQueryChange={setSearchQuery}
            />

            <AgendaGrid
                sessions={sessions}
                isLoading={isLoading}
                onSpeakerClick={setSelectedSpeaker}
                registeredIds={registeredIds}
                onToggleRegister={onToggleRegister}
            />

            {selectedSpeaker && (
                <SpeakerModal
                    speaker={selectedSpeaker}
                    onClose={() => setSelectedSpeaker(null)}
                />
            )}
        </div>
    );
}
