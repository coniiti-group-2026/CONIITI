/**
 * ===================================
 * Servicio de Agenda — Capa de Acceso a Datos
 * ===================================
 *
 * Abstrae la obtención de datos de la capa UI.
 * Actualmente usa datos simulados (mock); cambiar el import por
 * fetch/SWR/React Query cuando el backend (FastAPI) esté listo.
 */

import { MOCK_SESSIONS, CONFERENCE_DAYS } from './mockData';

/**
 * Recuperar todas las sesiones.
 * @returns {Promise<import('../types/session').Session[]>}
 */
export async function getSessions() {
    // Simular latencia de red
    await delay(300);
    return [...MOCK_SESSIONS];
}

/**
 * Recuperar sesiones para un día específico.
 * @param {string} day — Cadena de fecha ISO (ej. '2025-10-01')
 * @returns {Promise<import('../types/session').Session[]>}
 */
export async function getSessionsByDay(day) {
    const sessions = await getSessions();
    return sessions.filter((s) => s.dia === day);
}

/**
 * Filtrar sesiones por día y opcionalmente por modalidad.
 * @param {Object}      filters
 * @param {string}      filters.day      — Cadena de fecha ISO
 * @param {string|null} filters.modality — Valor de SESSION_MODALITY o null para todos
 * @returns {Promise<import('../types/session').Session[]>}
 */
export async function filterSessions({ day, modality }) {
    let sessions = await getSessionsByDay(day);

    if (modality) {
        sessions = sessions.filter((s) => s.modalidad === modality);
    }

    // Ordenar por hora de inicio
    sessions.sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));

    return sessions;
}

/**
 * Obtener los días de conferencia disponibles.
 * @returns {{ value: string, label: string }[]}
 */
export function getConferenceDays() {
    return CONFERENCE_DAYS;
}

/**
 * Verificar si hubo un cambio de salón dentro del número de
 * minutos dado (para resaltado de alertas).
 * @param {string} timestampISO — Marca de tiempo ISO 8601
 * @param {number} withinMinutes
 * @returns {boolean}
 */
export function isRecentChange(timestampISO, withinMinutes = 30) {
    const diff = Date.now() - new Date(timestampISO).getTime();
    return diff <= withinMinutes * 60 * 1000;
}

// ─── Ayudantes ─────────────────────────────────

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
