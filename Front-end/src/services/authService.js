// ============================================================
// Servicio de Autenticacion - CONIITI Front-end
// Consume exclusivamente auth-service a traves del gateway.
// ============================================================

const API_BASE = import.meta.env.VITE_API_URL || '/api';
const API_ORIGIN = import.meta.env.VITE_API_ORIGIN ?? '';
const AUTH_BASE = `${API_BASE}/auth`;

function getApiOrigin() {
    if (API_ORIGIN) {
        return API_ORIGIN.replace(/\/$/, '');
    }

    const isLocalFrontendDevPort = ['3000', '4173', '5173'].includes(window.location.port);
    if (isLocalFrontendDevPort) {
        return `${window.location.protocol}//${window.location.hostname}`;
    }

    return window.location.origin;
}

function buildAuthUrl(path) {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${AUTH_BASE}${normalizedPath}`;
}

function buildBrowserAuthUrl(path) {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    if (/^https?:\/\//i.test(AUTH_BASE)) {
        return `${AUTH_BASE}${normalizedPath}`;
    }
    return `${getApiOrigin()}${AUTH_BASE}${normalizedPath}`;
}

export function getMicrosoftLoginUrl() {
    return buildBrowserAuthUrl('/oauth/microsoft');
}

export function getGoogleLoginUrl() {
    return buildBrowserAuthUrl('/oauth/google');
}

async function apiFetch(path, options = {}) {
    const response = await fetch(path, {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail ?? 'Error inesperado del servidor.');
    }

    if (response.status === 204) return null;
    return response.json();
}

export async function register(data) {
    return apiFetch(buildAuthUrl('/register'), {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function login(data) {
    return apiFetch(buildAuthUrl('/login'), {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function getMe() {
    try {
        return await apiFetch(buildAuthUrl('/me'));
    } catch {
        return null;
    }
}

export async function logout() {
    return apiFetch(buildAuthUrl('/logout'), { method: 'POST' });
}

export async function verifyOtp() {
    throw new Error('El flujo OTP legacy fue retirado. Usa el nuevo login directo.');
}

export async function refreshToken() {
    throw new Error('La renovacion manual de tokens ya no esta disponible en el frontend.');
}

export async function forgotPassword(data) {
    return apiFetch(buildAuthUrl('/forgot-password'), {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function resetPassword(data) {
    return apiFetch(buildAuthUrl('/reset-password'), {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export function loginWithMicrosoft() {
    window.location.assign(getMicrosoftLoginUrl());
}

export function loginWithGoogle() {
    window.location.assign(getGoogleLoginUrl());
}
