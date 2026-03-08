// ============================================================
// Servicio de Usuarios — CONIITI Front-end
// Centraliza las llamadas HTTP para la gestión de cuentas staff.
// Solo utilizado desde el panel del superusuario.
// ============================================================

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

/**
 * Realiza una solicitud autenticada al API incluyendo cookies HttpOnly.
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
        throw new Error(errorData.detail ?? 'Error inesperado del servidor.');
    }

    if (response.status === 204) return null;

    return response.json();
}


// =============================================================
// Sección: CRUD de cuentas staff
// =============================================================

/**
 * Obtiene la lista de todos los usuarios con rol staff.
 *
 * @returns {Promise<Array>}
 */
export async function listStaff() {
    return apiFetch('/users/staff');
}

/**
 * Crea una nueva cuenta de staff.
 *
 * @param {{ full_name: string, email: string, institution?: string, password: string }} data
 */
export async function createStaff(data) {
    return apiFetch('/users/staff', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

/**
 * Actualiza los datos de una cuenta staff existente.
 *
 * @param {string} userId - UUID del usuario a actualizar
 * @param {object} data - Campos a actualizar (todos opcionales)
 */
export async function updateStaff(userId, data) {
    return apiFetch(`/users/staff/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

/**
 * Elimina permanentemente una cuenta staff.
 *
 * @param {string} userId - UUID del usuario a eliminar
 */
export async function deleteStaff(userId) {
    return apiFetch(`/users/staff/${userId}`, {
        method: 'DELETE',
    });
}
