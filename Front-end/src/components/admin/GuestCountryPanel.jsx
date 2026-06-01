import { useEffect, useMemo, useState } from 'react';
import { FiGlobe, FiRefreshCw, FiSave, FiSliders } from 'react-icons/fi';

import { useAuth } from '../../context/AuthContext';
import { useEventTheme } from '../../context/EventThemeContext';
import styles from '../../styles/components/GuestCountryPanel.module.css';

export default function GuestCountryPanel() {
    const { user } = useAuth();
    const { theme, presets, updateTheme, applyPreset, resetTheme } = useEventTheme();
    const [draft, setDraft] = useState(theme);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        setDraft(theme);
    }, [theme]);

    const selectedPresetId = useMemo(
        () => (presets.some((preset) => preset.id === draft.id) ? draft.id : 'custom'),
        [draft.id, presets],
    );

    if (user?.role !== 'superuser') {
        return null;
    }

    const handlePresetChange = (event) => {
        const preset = presets.find((item) => item.id === event.target.value);
        if (!preset) return;

        setSaved(false);
        setDraft((current) => ({
            ...current,
            ...preset,
        }));
    };

    const handleColorChange = (index, value) => {
        setSaved(false);
        setDraft((current) => {
            const nextColors = [...current.colors];
            nextColors[index] = value;
            return { ...current, id: 'custom', colors: nextColors };
        });
    };

    const handleSave = () => {
        updateTheme(draft);
        setSaved(true);
        window.setTimeout(() => setSaved(false), 2200);
    };

    const handleReset = () => {
        resetTheme();
        setSaved(false);
    };

    const handleApplyPreset = () => {
        applyPreset(draft.id);
        setSaved(true);
        window.setTimeout(() => setSaved(false), 2200);
    };

    return (
        <section className={styles.panel}>
            <div className={styles.header}>
                <div>
                    <span className={styles.eyebrow}>
                        <FiGlobe />
                        Pais invitado
                    </span>
                    <h1>Personalizacion visual</h1>
                    <p>
                        Ajusta los acentos del pais invitado sin cambiar la identidad base azul y dorada de CONIITI.
                    </p>
                </div>
                <div className={styles.previewFlag} aria-hidden="true">
                    {draft.colors.map((color, index) => (
                        <span key={`${color}-${index}`} style={{ backgroundColor: color }} />
                    ))}
                </div>
            </div>

            <div className={styles.contentGrid}>
                <form className={styles.form} onSubmit={(event) => { event.preventDefault(); handleSave(); }}>
                    <div className={styles.fieldGroup}>
                        <label htmlFor="guest-preset">Preset de pais</label>
                        <select id="guest-preset" value={selectedPresetId} onChange={handlePresetChange}>
                            {presets.map((preset) => (
                                <option key={preset.id} value={preset.id}>
                                    {preset.country}
                                </option>
                            ))}
                            <option value="custom" disabled>Personalizado</option>
                        </select>
                    </div>

                    <div className={styles.twoColumns}>
                        <div className={styles.fieldGroup}>
                            <label htmlFor="guest-country">Nombre visible</label>
                            <input
                                id="guest-country"
                                value={draft.country}
                                onChange={(event) => {
                                    setSaved(false);
                                    setDraft((current) => ({
                                        ...current,
                                        id: 'custom',
                                        country: event.target.value,
                                    }));
                                }}
                            />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label htmlFor="guest-edition">Etiqueta de edicion</label>
                            <input
                                id="guest-edition"
                                value={draft.editionLabel}
                                onChange={(event) => {
                                    setSaved(false);
                                    setDraft((current) => ({
                                        ...current,
                                        id: 'custom',
                                        editionLabel: event.target.value,
                                    }));
                                }}
                            />
                        </div>
                    </div>

                    <fieldset className={styles.colorSet}>
                        <legend>Colores de bandera</legend>
                        {draft.colors.map((color, index) => (
                            <label key={`${index}-${color}`} className={styles.colorControl}>
                                <span>Color {index + 1}</span>
                                <input
                                    type="color"
                                    value={color}
                                    onChange={(event) => handleColorChange(index, event.target.value)}
                                />
                                <code>{color}</code>
                            </label>
                        ))}
                    </fieldset>

                    <div className={styles.switchGrid}>
                        <label className={styles.switchRow}>
                            <input
                                type="checkbox"
                                checked={draft.siteAccentsEnabled}
                                onChange={(event) => {
                                    setSaved(false);
                                    setDraft((current) => ({
                                        ...current,
                                        siteAccentsEnabled: event.target.checked,
                                    }));
                                }}
                            />
                            <span>Acentos del pais en sitio y agenda</span>
                        </label>
                        <label className={styles.switchRow}>
                            <input
                                type="checkbox"
                                checked={draft.agendaParticlesEnabled}
                                onChange={(event) => {
                                    setSaved(false);
                                    setDraft((current) => ({
                                        ...current,
                                        agendaParticlesEnabled: event.target.checked,
                                    }));
                                }}
                            />
                            <span>Particulas del pais en agenda</span>
                        </label>
                    </div>

                    <div className={styles.actions}>
                        <button type="submit" className={styles.primaryBtn}>
                            <FiSave />
                            Guardar cambios
                        </button>
                        <button type="button" className={styles.secondaryBtn} onClick={handleApplyPreset}>
                            <FiSliders />
                            Aplicar preset
                        </button>
                        <button type="button" className={styles.ghostBtn} onClick={handleReset}>
                            <FiRefreshCw />
                            Restaurar Italia
                        </button>
                    </div>

                    {saved && <p className={styles.savedMessage}>Personalizacion aplicada.</p>}
                </form>

                <aside className={styles.preview}>
                    <div className={styles.previewTop}>
                        <span>{draft.editionLabel}</span>
                        <strong>{draft.country}</strong>
                    </div>
                    <div className={styles.previewAgenda}>
                        <div className={styles.previewParticle} />
                        <div>
                            <span className={styles.previewPill}>Agenda</span>
                            <h2>Conferencias y talleres</h2>
                            <p>Los acentos del pais aparecen en la agenda, el inicio y la barra superior.</p>
                        </div>
                    </div>
                    <div className={styles.previewCards}>
                        {draft.colors.map((color, index) => (
                            <span key={`${color}-${index}`} style={{ backgroundColor: color }} />
                        ))}
                    </div>
                </aside>
            </div>
        </section>
    );
}
