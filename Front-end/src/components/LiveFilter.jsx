import { FiSearch } from 'react-icons/fi';

import { SESSION_MODALITY, SESSION_EVENT_TYPE, SESSION_ROOMS } from '../types/session';
import styles from '../styles/components/LiveFilter.module.css';

const ROOM_OPTIONS = [
    { value: '', label: 'Todas' },
    ...Object.values(SESSION_ROOMS).map((room) => ({ value: room, label: room })),
];

export default function LiveFilter({
    days,
    activeDay,
    activeModality,
    activeEventType,
    searchQuery,
    onDayChange,
    onModalityChange,
    onEventTypeChange,
    activeRoom,
    onRoomChange,
    onSearchQueryChange,
}) {
    const handleModalityChange = (event) => {
        const value = event.target.value;
        onModalityChange(value === '' ? null : value);
    };

    return (
        <div className={styles.filterBar}>
            <div className={styles.dayTabs} role="tablist" aria-label="D\u00edas del congreso">
                {days.map((day) => (
                    <button
                        key={day.value}
                        role="tab"
                        aria-selected={activeDay === day.value}
                        className={`${styles.dayTab} ${activeDay === day.value ? styles.dayTabActive : ''}`}
                        onClick={() => onDayChange(day.value)}
                    >
                        {day.label}
                    </button>
                ))}
            </div>

            <div className={styles.separator} aria-hidden="true" />

            <div className={styles.selectWrapper}>
                <label className={styles.selectLabel} htmlFor="modality-select">
                    Modalidad
                </label>
                <select
                    id="modality-select"
                    className={styles.select}
                    value={activeModality ?? ''}
                    onChange={handleModalityChange}
                >
                    <option value="">Todas</option>
                    {Object.values(SESSION_MODALITY).map((modality) => (
                        <option key={modality} value={modality}>
                            {modality}
                        </option>
                    ))}
                </select>
            </div>

            <div className={styles.selectWrapper}>
                <label className={styles.selectLabel}>Actividad</label>
                <select
                    className={styles.select}
                    value={activeEventType ?? ''}
                    onChange={(event) => onEventTypeChange(event.target.value || null)}
                >
                    <option value="">Todos</option>
                    {Object.values(SESSION_EVENT_TYPE).map((eventType) => (
                        <option key={eventType} value={eventType}>{eventType}</option>
                    ))}
                </select>
            </div>

            <div className={`${styles.selectWrapper} ${styles.roomWrapper}`}>
                <label className={styles.selectLabel}>Sala</label>
                <select
                    className={`${styles.select} ${styles.roomSelect}`}
                    value={activeRoom ?? ''}
                    onChange={(event) => onRoomChange(event.target.value || null)}
                >
                    {ROOM_OPTIONS.map((room) => (
                        <option key={room.value || 'all'} value={room.value}>
                            {room.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className={styles.searchWrapper}>
                <FiSearch className={styles.searchIcon} />
                <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Tema o palabra clave..."
                    value={searchQuery}
                    onChange={(event) => onSearchQueryChange(event.target.value)}
                />
            </div>
        </div>
    );
}
