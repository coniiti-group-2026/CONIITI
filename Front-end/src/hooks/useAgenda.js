import { useState, useEffect, useCallback } from 'react';
import { filterSessions, getConferenceDays } from '../services/agendaService';

/**
 * useAgenda — encapsula todo el estado de la agenda y la lógica de filtrado.
 * Los días del congreso son fijos: Oct 1, 2 y 3 (2026-10-01/02/03).
 */
export function useAgenda() {
    const days = getConferenceDays();
    const [activeDay, setActiveDay]             = useState(days[0].value);
    const [activeModality, setActiveModality]   = useState(null);
    const [activeEventType, setActiveEventType] = useState(null);
    const [searchQuery, setSearchQuery]         = useState('');
    const [sessions, setSessions]               = useState([]);
    const [isLoading, setIsLoading]             = useState(true);

    const fetchSessions = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await filterSessions({
                day:       activeDay,
                modality:  activeModality,
                eventType: activeEventType,
                search:    searchQuery,
            });
            setSessions(data);
        } catch (err) {
            console.error('[useAgenda] Error al obtener las sesiones:', err);
            setSessions([]);
        } finally {
            setIsLoading(false);
        }
    }, [activeDay, activeModality, activeEventType, searchQuery]);

    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

    return {
        sessions,
        days,
        activeDay,
        activeModality,
        activeEventType,
        searchQuery,
        isLoading,
        setActiveDay,
        setActiveModality,
        setActiveEventType,
        setSearchQuery,
        refresh: fetchSessions,
    };
}
