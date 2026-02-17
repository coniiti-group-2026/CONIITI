import { useState, useEffect, useCallback } from 'react';
import { filterSessions, getConferenceDays } from '../services/agendaService';

/**
 * useAgenda — encapsula todo el estado de la agenda y la lógica de filtrado.
 *
 * Mantiene el estado para: día activo, filtro de modalidad activo,
 * lista de sesiones filtradas y bandera de carga.
 *
 * @returns {{
 *   sessions:       import('../types/session').Session[],
 *   days:           { value: string, label: string }[],
 *   activeDay:      string,
 *   activeModality: string | null,
 *   isLoading:      boolean,
 *   setActiveDay:   (day: string) => void,
 *   setActiveModality: (mod: string | null) => void,
 *   refresh:        () => void,
 * }}
 */
export function useAgenda() {
    const days = getConferenceDays();
    const [activeDay, setActiveDay] = useState(days[0].value);
    const [activeModality, setActiveModality] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchSessions = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await filterSessions({
                day: activeDay,
                modality: activeModality,
            });
            setSessions(data);
        } catch (err) {
            console.error('[useAgenda] Error fetching sessions:', err);
            setSessions([]);
        } finally {
            setIsLoading(false);
        }
    }, [activeDay, activeModality]);

    // Volver a obtener cuando cambian los filtros
    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

    return {
        sessions,
        days,
        activeDay,
        activeModality,
        isLoading,
        setActiveDay,
        setActiveModality,
        refresh: fetchSessions,
    };
}
