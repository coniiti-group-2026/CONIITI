import { getApiBase, getJsonHeaders } from './apiConfig';
import { getContentSection } from './contentService';


const API_BASE = getApiBase();

function mapCommitteeMember(member) {
    return {
        id: member.id,
        title: member.nombre,
        subtitle: [member.cargo, member.institucion].filter(Boolean).join(' | '),
        description: member.bio,
        image_url: member.foto_url,
        is_active: member.activo,
        sort_order: member.orden,
    };
}

async function apiFetch(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        credentials: 'include',
        headers: getJsonHeaders(options),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail ?? 'No se pudo cargar el comite.');
    }

    return response.status === 204 ? null : response.json();
}

export async function fetchCommitteeMembers() {
    const members = await apiFetch('/committees/members?active_only=true');
    return Array.isArray(members) ? members.map(mapCommitteeMember) : [];
}

export function getCommitteeFallback() {
    return getContentSection('comite');
}
