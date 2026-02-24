/**
 * Servicio de Agenda — Capa de Acceso a Datos
 * Abstrae la obtención de datos de la capa UI.
 * Cambiar los imports por fetch/SWR cuando el backend (FastAPI) esté listo.
 */

import { MOCK_SESSIONS, CONFERENCE_DAYS, MOCK_SPEAKERS } from './mockData';

/** Retorna una copia de todas las sesiones */
export async function getSessions() {
    await delay(300);
    return [...MOCK_SESSIONS];
}

/** Retorna todas las sesiones de forma síncrona (para filtrar en el cliente) */
export function getAllSessions() {
    return [...MOCK_SESSIONS];
}

/** Filtra sesiones por día, modalidad, tipo de evento y búsqueda de texto */
export async function filterSessions({ day, modality, eventType, search }) {
    let sessions = await getSessions();

    if (day) {
        sessions = sessions.filter((s) => s.dia === day);
    }
    if (modality) {
        sessions = sessions.filter((s) => s.modalidad === modality);
    }
    if (eventType) {
        sessions = sessions.filter((s) => s.event_type === eventType);
    }
    if (search && search.trim() !== '') {
        const q = search.toLowerCase().trim();
        sessions = sessions.filter(
            (s) =>
                s.titulo.toLowerCase().includes(q) ||
                s.ponente.toLowerCase().includes(q) ||
                s.track.toLowerCase().includes(q) ||
                s.descripcion.toLowerCase().includes(q)
        );
    }

    sessions.sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));
    return sessions;
}

/** Obtiene los días de conferencia disponibles */
export function getConferenceDays() {
    return CONFERENCE_DAYS;
}

/** Busca un ponente por su ID */
export function getSpeakerById(id) {
    return MOCK_SPEAKERS.find((sp) => sp.id === id) ?? null;
}

/** Retorna todos los ponentes */
export function getAllSpeakers() {
    return [...MOCK_SPEAKERS];
}

/** Verifica si hubo un cambio de salón reciente (default: últimos 30 min) */
export function isRecentChange(timestampISO, withinMinutes = 30) {
    const diff = Date.now() - new Date(timestampISO).getTime();
    return diff <= withinMinutes * 60 * 1000;
}

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
