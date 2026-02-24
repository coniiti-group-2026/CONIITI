import { SESSION_MODALITY, SESSION_EVENT_TYPE } from '../../types/session';
import { FiSearch } from 'react-icons/fi';
import styles from './LiveFilter.module.css';

/**
 * LiveFilter — pestañas selectoras de día + dropdown de modalidad.
 *
 * @param {{
 *   days:            { value: string, label: string }[],
 *   activeDay:       string,
 *   activeModality:  string | null,
 *   onDayChange:     (day: string) => void,
 *   onModalityChange:(mod: string | null) => void,
 * }} props
 */
export default function LiveFilter({
    days,
    activeDay,
    activeModality,
    activeEventType,
    searchQuery,
    onDayChange,
    onModalityChange,
    onEventTypeChange,
    onSearchQueryChange,

}) {
    const handleModalityChange = (e) => {
        const value = e.target.value;
        onModalityChange(value === '' ? null : value);
    };

    return (
        <div className={styles.filterBar}>
            {/* Pestañas de día */}
            <div className={styles.dayTabs} role="tablist" aria-label="Días del congreso">
                {days.map((day) => (
                    <button
                        key={day.value}
                        role="tab"
                        aria-selected={activeDay === day.value}
                        className={`${styles.dayTab} ${activeDay === day.value ? styles.dayTabActive : ''
                            }`}
                        onClick={() => onDayChange(day.value)}
                    >
                        {day.label}
                    </button>
                ))}
            </div>

            <div className={styles.separator} aria-hidden="true" />

            {/* Filtro de modalidad */}
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
                    {Object.values(SESSION_MODALITY).map((mod) => (
                        <option key={mod} value={mod}>
                            {mod}
                        </option>
                    ))}
                </select>
            </div>


            {/* Filtro por Tipo de eveto */}
            <div className={styles.selectWrapper}>
                <label className={styles.selectLabel}>Tipo</label>
                <select
                    className={styles.select}
                    value={activeEventType ?? ''}
                    onChange={(e) => onEventTypeChange(e.target.value || null)}
                >
                    <option value="">Todos</option>
                    {Object.values(SESSION_EVENT_TYPE).map((t) => (
                        <option key={t} value={t}>{t}</option>
                    ))}
                </select>
            </div>


            {/* Filtro de búsqueda: buscador*/}
            <div className={styles.searchWrapper}>
                <FiSearch className={styles.searchIcon} />
                <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Buscar tema..."
                    value={searchQuery}
                    onChange={(e) => onSearchQueryChange(e.target.value)}
                />
            </div>

        </div>
    );
}
