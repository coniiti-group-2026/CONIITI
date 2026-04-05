import { getApiBase, getJsonHeaders } from './apiConfig';

const API_BASE = getApiBase();

export const PAYMENT_PLANS = [
    {
        id: 'member-speaker',
        title: 'Miembros UCatólica e IEEE',
        amountLabel: '$ 940.000',
        localAmount: 940000,
        internationalAmount: 235,
        localCurrency: 'COP',
        internationalCurrency: 'USD',
        features: [
            'Inscripción como ponente',
            'Constancia de participación para todos los autores',
            'Publicación de las memorias',
        ],
        optional: false,
    },
    {
        id: 'general-speaker',
        title: 'Si no eres miembro de UCatólica o IEEE',
        amountLabel: '$ 980.000',
        localAmount: 980000,
        internationalAmount: 245,
        localCurrency: 'COP',
        internationalCurrency: 'USD',
        features: [
            'Inscripción como ponente',
            'Constancia de participación para todos los autores',
            'Publicación de las memorias',
        ],
        optional: false,
    },
    {
        id: 'conference-certificate',
        title: 'Constancia de participación en conferencias',
        amountLabel: '$ 120.000',
        localAmount: 120000,
        internationalAmount: 30,
        localCurrency: 'COP',
        internationalCurrency: 'USD',
        features: [
            'Certificado de asistencia',
        ],
        optional: true,
    },
    {
        id: 'workshop-certificate',
        title: 'Constancia de participación en talleres',
        amountLabel: '$ 90.000',
        localAmount: 90000,
        internationalAmount: 23,
        localCurrency: 'COP',
        internationalCurrency: 'USD',
        features: [
            'Certificado de asistencia',
        ],
        optional: true,
    },
];

async function apiFetch(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        credentials: 'include',
        headers: getJsonHeaders(options),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail ?? 'No se pudo iniciar el pago.');
    }

    if (response.status === 204) return null;
    return response.json();
}

export async function createCheckout({ userId, amount, currency, paymentRegion }) {
    return apiFetch('/payments/create-checkout', {
        method: 'POST',
        body: JSON.stringify({
            user_id: userId,
            amount,
            currency,
            payment_region: paymentRegion,
        }),
    });
}
