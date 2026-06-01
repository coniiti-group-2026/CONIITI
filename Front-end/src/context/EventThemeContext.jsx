import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'coniiti_guest_country_theme';

// eslint-disable-next-line react-refresh/only-export-components
export const GUEST_COUNTRY_PRESETS = [
    {
        id: 'italia',
        country: 'Italia',
        editionLabel: 'Edicion Italia 2026',
        colors: ['#009246', '#ffffff', '#ce2b37'],
    },
    {
        id: 'brasil',
        country: 'Brasil',
        editionLabel: 'Edicion Brasil 2026',
        colors: ['#009b3a', '#ffdf00', '#002776'],
    },
    {
        id: 'mexico',
        country: 'Mexico',
        editionLabel: 'Edicion Mexico 2026',
        colors: ['#006847', '#ffffff', '#ce1126'],
    },
    {
        id: 'espana',
        country: 'Espana',
        editionLabel: 'Edicion Espana 2026',
        colors: ['#aa151b', '#f1bf00', '#aa151b'],
    },
    {
        id: 'francia',
        country: 'Francia',
        editionLabel: 'Edicion Francia 2026',
        colors: ['#0055a4', '#ffffff', '#ef4135'],
    },
    {
        id: 'argentina',
        country: 'Argentina',
        editionLabel: 'Edicion Argentina 2026',
        colors: ['#74acdf', '#ffffff', '#f6b40e'],
    },
];

const DEFAULT_THEME = {
    ...GUEST_COUNTRY_PRESETS[0],
    siteAccentsEnabled: true,
    agendaParticlesEnabled: true,
};

const EventThemeContext = createContext({
    theme: DEFAULT_THEME,
    presets: GUEST_COUNTRY_PRESETS,
    updateTheme: () => {},
    applyPreset: () => {},
    resetTheme: () => {},
});

function isHexColor(value) {
    return /^#[0-9a-f]{6}$/i.test(value);
}

function hexToRgb(value) {
    const normalized = isHexColor(value) ? value.slice(1) : '000000';
    const numeric = Number.parseInt(normalized, 16);

    return [
        (numeric >> 16) & 255,
        (numeric >> 8) & 255,
        numeric & 255,
    ].join(', ');
}

function normalizeTheme(value) {
    const source = value && typeof value === 'object' ? value : {};
    const colors = Array.isArray(source.colors) ? source.colors : DEFAULT_THEME.colors;
    const normalizedColors = [0, 1, 2].map((index) => (
        isHexColor(colors[index]) ? colors[index] : DEFAULT_THEME.colors[index]
    ));

    return {
        id: typeof source.id === 'string' && source.id ? source.id : DEFAULT_THEME.id,
        country: typeof source.country === 'string' && source.country.trim()
            ? source.country.trim()
            : DEFAULT_THEME.country,
        editionLabel: typeof source.editionLabel === 'string' && source.editionLabel.trim()
            ? source.editionLabel.trim()
            : DEFAULT_THEME.editionLabel,
        colors: normalizedColors,
        siteAccentsEnabled: source.siteAccentsEnabled !== false,
        agendaParticlesEnabled: source.agendaParticlesEnabled !== false,
    };
}

function loadStoredTheme() {
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        return stored ? normalizeTheme(JSON.parse(stored)) : DEFAULT_THEME;
    } catch {
        return DEFAULT_THEME;
    }
}

function persistTheme(theme) {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
    } catch {
        // Ignore storage quota/private-mode errors.
    }
}

function applyThemeVariables(theme) {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    const [first, second, third] = theme.colors;
    root.style.setProperty('--guest-color-one', first);
    root.style.setProperty('--guest-color-two', second);
    root.style.setProperty('--guest-color-three', third);
    root.style.setProperty('--guest-color-one-rgb', hexToRgb(first));
    root.style.setProperty('--guest-color-two-rgb', hexToRgb(second));
    root.style.setProperty('--guest-color-three-rgb', hexToRgb(third));
    root.style.setProperty(
        '--guest-flag-gradient',
        `linear-gradient(90deg, ${first} 0 33%, ${second} 33% 66%, ${third} 66% 100%)`,
    );
    root.dataset.guestAccents = theme.siteAccentsEnabled ? 'on' : 'off';
}

export function EventThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => (
        typeof window === 'undefined' ? DEFAULT_THEME : loadStoredTheme()
    ));

    useEffect(() => {
        applyThemeVariables(theme);
        persistTheme(theme);
    }, [theme]);

    const value = useMemo(() => ({
        theme,
        presets: GUEST_COUNTRY_PRESETS,
        updateTheme: (patch) => setTheme((current) => normalizeTheme({ ...current, ...patch })),
        applyPreset: (presetId) => {
            const preset = GUEST_COUNTRY_PRESETS.find((item) => item.id === presetId);
            if (!preset) return;

            setTheme((current) => normalizeTheme({
                ...current,
                ...preset,
                siteAccentsEnabled: current.siteAccentsEnabled,
                agendaParticlesEnabled: current.agendaParticlesEnabled,
            }));
        },
        resetTheme: () => setTheme(DEFAULT_THEME),
    }), [theme]);

    return (
        <EventThemeContext.Provider value={value}>
            {children}
        </EventThemeContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useEventTheme() {
    return useContext(EventThemeContext);
}
