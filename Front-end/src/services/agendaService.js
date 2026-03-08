// ============================================================
// Servicio de Agenda — CONIITI Front-end
// Capa de acceso a datos para las sesiones del congreso.
// Consume la API REST del back-end FastAPI.
// Mantiene la misma firma de funciones anterior para no
// romper los hooks y componentes existentes.
// ============================================================

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

/**
 * Realiza una solicitud al API con manejo de errores centralizado.
 *
 * @param {string} path - Ruta relativa del endpoint
 * @param {RequestInit} options - Opciones del fetch
 * @returns {Promise<any>}
 */
async function apiFetch(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail ?? 'Error al comunicarse con el servidor.');
    }

    if (response.status === 204) return null;

    return response.json();
}

/**
 * Construye la query string a partir de un objeto de filtros,
 * omitiendo los valores null, undefined o cadenas vacías.
 *
 * @param {object} filters
 * @returns {string}
 */
function buildQueryString(filters) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
            params.append(key, value);
        }
    });
    const qs = params.toString();
    return qs ? `?${qs}` : '';
}


// =============================================================
// Sección: Consultas de sesiones (públicas)
// =============================================================

/**
 * Retorna todas las sesiones sin filtros.
 *
 * @returns {Promise<Array>}
 */
export async function getSessions() {
    const data = await apiFetch('/sessions');
    return data.sessions ?? [];
}

/**
 * Retorna todas las sesiones de forma síncrona.
 * NOTA: Reemplazado por getSessions() asincrónico.
 * Conservado por compatibilidad con StaffDashboard.
 *
 * @deprecated Usar getSessions() en su lugar
 */
export function getAllSessions() {
    console.warn('[agendaService] getAllSessions() está deprecado. Usar getSessions().');
    return [];
}

/**
 * Filtra sesiones por día, modalidad, tipo de evento y búsqueda de texto.
 *
 * @param {{ day?: string, modality?: string, eventType?: string, search?: string }} filters
 * @returns {Promise<Array>}
 */
export async function filterSessions({ day, modality, eventType, search } = {}) {
    const qs = buildQueryString({
        day,
        modality,
        event_type: eventType,
        search,
    });
    const data = await apiFetch(`/sessions${qs}`);
    return data.sessions ?? [];
}

/**
 * Obtiene el detalle de una sesión por su ID.
 *
 * @param {string} sessionId - UUID de la sesión
 * @returns {Promise<object>}
 */
export async function getSessionById(sessionId) {
    return apiFetch(`/sessions/${sessionId}`);
}

/**
 * Retorna los días del congreso (dato de configuración, no de BD).
 * El congreso CONIITI 2026 se celebra los días 1, 2 y 3 de octubre.
 *
 * @returns {Array<{ value: string, label: string }>}
 */
export function getConferenceDays() {
    return [
        { value: '2026-10-01', label: 'Oct 1' },
        { value: '2026-10-02', label: 'Oct 2' },
        { value: '2026-10-03', label: 'Oct 3' },
    ];
}


// =============================================================
// Sección: CRUD de sesiones (staff y superusuario)
// =============================================================

/**
 * Crea una nueva sesión de agenda.
 *
 * @param {object} data - Datos de la sesión (ver SessionCreate en el back-end)
 * @returns {Promise<object>}
 */
export async function createSession(data) {
    return apiFetch('/sessions', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

/**
 * Actualiza los datos de una sesión existente.
 *
 * @param {string} sessionId - UUID de la sesión
 * @param {object} data - Campos a actualizar
 * @returns {Promise<object>}
 */
export async function updateSession(sessionId, data) {
    return apiFetch(`/sessions/${sessionId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

/**
 * Elimina permanentemente una sesión.
 *
 * @param {string} sessionId - UUID de la sesión
 */
export async function deleteSession(sessionId) {
    return apiFetch(`/sessions/${sessionId}`, {
        method: 'DELETE',
    });
}

/**
 * Alterna el estado de verificación del enlace virtual de una sesión.
 *
 * @param {string} sessionId - UUID de la sesión
 * @returns {Promise<object>}
 */
export async function toggleLinkVerified(sessionId) {
    return apiFetch(`/sessions/${sessionId}/verify-link`, {
        method: 'PATCH',
    });
}


// =============================================================
// Sección: Ponentes (compatibilidad con SpeakerModal)
// =============================================================

/**
 * Busca un ponente por su ID.
 * NOTA: En esta versión, el modelo de ponentes aún no
 * tiene su propia tabla en el back-end. Se retorna null.
 *
 * @param {string} id - ID del ponente
 * @returns {null}
 */
export function getSpeakerById(id) {
    return null;
}

/**
 * Verifica si un timestamp está dentro del rango de "cambio reciente".
 *
 * @param {string} timestampISO - Timestamp en formato ISO 8601
 * @param {number} withinMinutes - Minutos de margen (por defecto 30)
 * @returns {boolean}
 */
export function isRecentChange(timestampISO, withinMinutes = 30) {
    const diff = Date.now() - new Date(timestampISO).getTime();
    return diff <= withinMinutes * 60 * 1000;
}
