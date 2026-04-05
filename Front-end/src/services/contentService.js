import { getApiBase, getJsonHeaders } from './apiConfig';


const API_BASE = getApiBase();
const FILES_BASE = `${API_BASE}/files`;

const FALLBACK_CONTENT_SECTIONS = {
    memorias: [
        {
            id: 'mem-2026-1',
            title: 'Memorias CONIITI 2026',
            year: 2026,
            description: 'Compilado oficial de ponencias, talleres y resultados destacados del congreso.',
            image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
            link_url: 'https://coniiti.ucatolica.edu.co/',
            is_active: true,
            sort_order: 0,
        },
        {
            id: 'mem-2025-1',
            title: 'Memorias CONIITI 2025',
            year: 2025,
            description: 'Edición anterior con resultados de investigación en software, datos e innovación aplicada.',
            image_url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=80',
            link_url: 'https://coniiti.ucatolica.edu.co/',
            is_active: true,
            sort_order: 1,
        },
    ],
    comite: [
        {
            id: 'com-1',
            title: 'Dra. Lina Moreno',
            subtitle: 'Presidencia del comité científico',
            description: 'Coordina la evaluación académica y la articulación internacional del evento.',
            image_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=700&q=80',
            is_active: true,
            sort_order: 0,
        },
        {
            id: 'com-2',
            title: 'Ing. Mauricio Perez',
            subtitle: 'Coordinación logística',
            description: 'Responsable de la operación integral de agenda, auditorios y experiencia de asistentes.',
            image_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=700&q=80',
            is_active: true,
            sort_order: 1,
        },
    ],
    autores: [
        {
            id: 'aut-1',
            title: 'Semillero AI Systems',
            subtitle: 'Universidad Católica de Colombia',
            description: 'Equipo de investigadores enfocado en sistemas inteligentes, agentes autónomos y aprendizaje aplicado.',
            image_url: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=700&q=80',
            is_active: true,
            sort_order: 0,
        },
        {
            id: 'aut-2',
            title: 'Grupo DataLab',
            subtitle: 'Red de analítica e innovación',
            description: 'Autores invitados con trabajos en ciencia de datos, IA responsable y automatización industrial.',
            image_url: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=700&q=80',
            is_active: true,
            sort_order: 1,
        },
    ],
    galerias: [
        {
            id: 'gal-1',
            title: 'Apertura plenaria',
            description: 'Inicio oficial del congreso con invitados internacionales y comunidad académica.',
            image_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
            is_active: true,
            sort_order: 0,
        },
        {
            id: 'gal-2',
            title: 'Networking y poster sessions',
            description: 'Espacios de intercambio entre estudiantes, industria y grupos de investigación.',
            image_url: 'https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&w=1200&q=80',
            is_active: true,
            sort_order: 1,
        },
    ],
    conferencistas: [],
};

function getFallbackContentSection(section) {
    return FALLBACK_CONTENT_SECTIONS[section] ?? [];
}

async function apiFetch(path, options = {}) {
    const response = await fetch(`${FILES_BASE}${path}`, {
        ...options,
        credentials: 'include',
        headers: getJsonHeaders(options),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail ?? 'No se pudo completar la operación de contenido.');
    }

    if (response.status === 204) return null;
    return response.json();
}

export function getContentSection(section) {
    return getFallbackContentSection(section);
}

export async function fetchContentSection(section) {
    try {
        const cards = await apiFetch(`/content/cards/${section}?active_only=true`);
        return Array.isArray(cards) ? cards : getFallbackContentSection(section);
    } catch {
        return getFallbackContentSection(section);
    }
}

export async function fetchAdminContentSection(section) {
    const cards = await apiFetch(`/content/cards/${section}?active_only=false`);
    return Array.isArray(cards) ? cards : [];
}

export async function createContentCard(data) {
    return apiFetch('/content/cards', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function updateContentCard(cardId, data) {
    return apiFetch(`/content/cards/${cardId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

export async function deleteContentCard(cardId) {
    return apiFetch(`/content/cards/${cardId}`, {
        method: 'DELETE',
    });
}
