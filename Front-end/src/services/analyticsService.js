import { getApiBase, getJsonHeaders } from './apiConfig';


const API_BASE = getApiBase();

async function apiFetch(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        credentials: 'include',
        headers: getJsonHeaders(options),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail ?? 'No se pudo obtener la información de actividad.');
    }

    if (response.status === 204) return null;
    return response.json();
}

export async function getAnalyticsStats() {
    return apiFetch('/analytics/stats');
}

export async function getNotificationEvents(limit = 12) {
    return apiFetch(`/notifications/events?limit=${limit}`);
}
