import { useState } from 'react';

import LiveFilter from '../components/LiveFilter';
import AgendaGrid from '../components/AgendaGrid';
import SpeakerModal from '../components/SpeakerModal';
import { useEventTheme } from '../context/EventThemeContext';
import { useAgenda } from '../hooks/useAgenda';
import { usePolling } from '../hooks/usePolling';
import styles from '../styles/pages/Agenda.module.css';

export default function Agenda({ registeredIds = new Set(), onToggleRegister }) {
    const [selectedSpeaker, setSelectedSpeaker] = useState(null);
    const { theme } = useEventTheme();

    const {
        searchQuery, setSearchQuery,
        activeEventType, setActiveEventType,
        activeRoom, setActiveRoom,
        sessions, days, activeDay, activeModality,
        isLoading, setActiveDay, setActiveModality, refresh,
    } = useAgenda();

    usePolling(refresh, 60_000);

    const activeDayLabel = days.find((day) => day.value === activeDay)?.label ?? 'Dia seleccionado';

    return (
        <div className={styles.agendaPage}>
            <section className={styles.hero}>
                {theme.siteAccentsEnabled && theme.agendaParticlesEnabled && (
                    <div className={styles.particleField} aria-hidden="true" />
                )}

                <div className={styles.heroContent}>
                    <div>
                        <span className={styles.eyebrow}>{theme.editionLabel}</span>
                        <h1>Agenda CONIITI 2026</h1>
                        <p>Explora sesiones, talleres y ponencias por dia, sala y modalidad.</p>
                    </div>

                    <div className={styles.countryPanel}>
                        <span>Pais invitado</span>
                        <strong>{theme.country}</strong>
                        {theme.siteAccentsEnabled && (
                            <div className={styles.flagStrip} aria-hidden="true">
                                {theme.colors.map((color, index) => (
                                    <i key={`${color}-${index}`} style={{ backgroundColor: color }} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.quickStats}>
                    <div>
                        <strong>{sessions.length}</strong>
                        <span>{sessions.length === 1 ? 'sesion visible' : 'sesiones visibles'}</span>
                    </div>
                    <div>
                        <strong>{activeDayLabel}</strong>
                        <span>dia activo</span>
                    </div>
                    <div>
                        <strong>{activeModality ?? 'Todas'}</strong>
                        <span>modalidad</span>
                    </div>
                </div>
            </section>

            <div className={styles.pollingBar}>
                <span className={styles.pollingDot} />
                La agenda se actualiza automaticamente para mostrarte la informacion mas reciente.
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
