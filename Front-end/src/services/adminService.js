const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

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
        throw new Error(errorData.detail ?? 'Error inesperado del servidor.');
    }

    if (response.status === 204) return null;

    return response.json();
}

export const getDashboardStats = async () => {
    return apiFetch('/admin/dashboard-stats');
};
