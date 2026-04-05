import { getApiBase, getJsonHeaders } from './apiConfig';


const API_BASE = getApiBase();
const FILES_BASE = `${API_BASE}/files`;

async function apiFetch(path, options = {}) {
    const response = await fetch(`${FILES_BASE}${path}`, {
        ...options,
        credentials: 'include',
        headers: getJsonHeaders(options),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail ?? 'No se pudo completar la operación de archivos.');
    }

    if (response.status === 204) return null;
    return response.json();
}

export async function uploadAsset(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${FILES_BASE}/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail ?? 'No se pudo subir el archivo.');
    }

    return response.json();
}

export async function listAssets(limit = 50) {
    const query = new URLSearchParams({ limit: String(limit) });
    return apiFetch(`/assets?${query.toString()}`);
}

export async function deleteAsset(assetId) {
    return apiFetch(`/assets/${assetId}`, {
        method: 'DELETE',
    });
}

export async function listDocuments(filters = {}) {
    const query = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            query.set(key, value);
        }
    });

    const suffix = query.toString() ? `?${query.toString()}` : '';
    return apiFetch(`/documents${suffix}`);
}

export async function createDocument(data) {
    return apiFetch('/documents', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function deleteDocument(documentId) {
    return apiFetch(`/documents/${documentId}`, {
        method: 'DELETE',
    });
}
