import { getApiBase } from './apiConfig';


const API_BASE = getApiBase();

export const HEALTH_TARGETS = [
    { id: 'auth', label: 'Auth', path: '/auth/health' },
    { id: 'users', label: 'Users', path: '/users/health' },
    { id: 'agenda', label: 'Agenda', path: '/agenda/health' },
    { id: 'files', label: 'Files', path: '/files/health' },
    { id: 'payments', label: 'Payments', path: '/payments/health' },
    { id: 'analytics', label: 'Analytics', path: '/analytics/health' },
    { id: 'notifications', label: 'Notifications', path: '/notifications/health' },
];

async function checkTarget(target) {
    const startedAt = performance.now();

    try {
        const response = await fetch(`${API_BASE}${target.path}`, {
            credentials: 'include',
        });
        const latencyMs = Math.round(performance.now() - startedAt);
        const payload = await response.json().catch(() => ({}));

        return {
            ...target,
            ok: response.ok,
            statusCode: response.status,
            latencyMs,
            payload,
        };
    } catch (error) {
        return {
            ...target,
            ok: false,
            statusCode: null,
            latencyMs: Math.round(performance.now() - startedAt),
            error: error.message,
        };
    }
}

export async function checkSystemStatus() {
    return Promise.all(HEALTH_TARGETS.map(checkTarget));
}
