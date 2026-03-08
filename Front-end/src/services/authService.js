// ============================================================
// Servicio de Autenticación — CONIITI Front-end
// Centraliza todas las llamadas HTTP relacionadas con el
// ciclo de autenticación: registro, OTP, login y sesión.
// Los tokens JWT viajan en cookies HttpOnly gestionadas
// automáticamente por el navegador.
// ============================================================

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

/**
 * Realiza una solicitud HTTP al API con manejo centralizado de errores.
 * Incluye `credentials: 'include'` para que el navegador envíe las cookies HttpOnly.
 *
 * @param {string} path - Ruta relativa del endpoint (ej: '/auth/login')
 * @param {RequestInit} options - Opciones del fetch
 * @returns {Promise<any>} - Datos JSON de la respuesta
 * @throws {Error} - Error con el mensaje del API si la respuesta no es exitosa
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

    // Retorna null si la respuesta es 204 No Content
    if (response.status === 204) return null;

    return response.json();
}


// =============================================================
// Sección: Registro
// =============================================================

/**
 * Registra un nuevo usuario en la plataforma.
 * El servidor enviará un código OTP al correo del usuario.
 *
 * @param {{ full_name: string, email: string, institution?: string, role: string, password: string, accept_data_policy: boolean }} data
 */
export async function register(data) {
    return apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}


// =============================================================
// Sección: Verificación OTP
// =============================================================

/**
 * Verifica el código OTP de 6 dígitos recibido por correo.
 * Si es exitoso, el servidor establece las cookies JWT de sesión.
 *
 * @param {{ email: string, code: string, purpose: 'register' | 'login' }} data
 */
export async function verifyOtp(data) {
    return apiFetch('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}


// =============================================================
// Sección: Inicio de sesión local
// =============================================================

/**
 * Inicia sesión con email y contraseña.
 * Si las credenciales son correctas, el servidor envía un código OTP al correo.
 * El cliente debe redirigir a la pantalla de verificación OTP.
 *
 * @param {{ email: string, password: string }} data
 */
export async function login(data) {
    return apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}


// =============================================================
// Sección: OAuth
// =============================================================

/**
 * Redirige el navegador al proveedor de identidad de Microsoft.
 * El flujo OAuth continúa en el back-end de forma transparente.
 */
export function loginWithMicrosoft() {
    window.location.href = `${API_BASE}/auth/oauth/microsoft`;
}

/**
 * Redirige el navegador al proveedor de identidad de Google.
 * El flujo OAuth continúa en el back-end de forma transparente.
 */
export function loginWithGoogle() {
    window.location.href = `${API_BASE}/auth/oauth/google`;
}


// =============================================================
// Sección: Sesión activa
// =============================================================

/**
 * Obtiene el perfil del usuario actualmente autenticado.
 * Retorna null si no hay sesión activa (en lugar de lanzar error).
 */
export async function getMe() {
    try {
        return await apiFetch('/auth/me');
    } catch {
        return null;
    }
}

/**
 * Cierra la sesión del usuario.
 * El servidor elimina las cookies HttpOnly del navegador.
 */
export async function logout() {
    return apiFetch('/auth/logout', { method: 'POST' });
}

/**
 * Renueva el access token usando el refresh token (cookie HttpOnly).
 * Se llama automáticamente cuando el access token ha expirado.
 */
export async function refreshToken() {
    return apiFetch('/auth/refresh', { method: 'POST' });
}

/**
 * Solicita el envío de un código OTP de recuperación de contraseña.
 * Solo disponible para usuarios con rol student o external.
 * @param {string} email - Correo del usuario
 */
export async function forgotPassword(email) {
    return apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
    });
}

/**
 * Restablece la contraseña del usuario verificando el OTP recibido.
 * @param {string} email - Correo del usuario
 * @param {string} code - Código OTP de 6 dígitos
 * @param {string} newPassword - Nueva contraseña (mínimo 8 caracteres)
 */
export async function resetPassword(email, code, newPassword) {
    return apiFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, code, new_password: newPassword }),
    });
}
