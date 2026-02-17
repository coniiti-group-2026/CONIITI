import { SESSION_MODALITY } from '../../types/session';
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
    onDayChange,
    onModalityChange,
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
        </div>
    );
}
