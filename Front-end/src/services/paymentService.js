import { getApiBase, getJsonHeaders } from './apiConfig';

const API_BASE = getApiBase();

export const PAYMENT_PLANS = [
    {
        id: 'member-speaker',
        title: 'Miembros UCatolica e IEEE',
        amountLabel: '$ 940.000',
        localAmount: 940000,
        internationalAmount: 235,
        localCurrency: 'COP',
        internationalCurrency: 'USD',
        features: [
            'Inscripcion como Ponente',
            'Constancia de participacion para todos los autores',
            'Publicacion de las memorias',
        ],
        optional: false,
    },
    {
        id: 'general-speaker',
        title: 'Si no eres miembro UCatolica o IEEE',
        amountLabel: '$ 980.000',
        localAmount: 980000,
        internationalAmount: 245,
        localCurrency: 'COP',
        internationalCurrency: 'USD',
        features: [
            'Inscripcion como Ponente',
            'Constancia de participacion para todos los autores',
            'Publicacion de las memorias',
        ],
        optional: false,
    },
    {
        id: 'conference-certificate',
        title: 'Si desea constancia por participacion en conferencias',
        amountLabel: '$ 120.000',
        localAmount: 120000,
        internationalAmount: 30,
        localCurrency: 'COP',
        internationalCurrency: 'USD',
        features: [
            'Certificado de Asistencia',
        ],
        optional: true,
    },
    {
        id: 'workshop-certificate',
        title: 'Si desea constancia por participacion en Workshops',
        amountLabel: '$ 90.000',
        localAmount: 90000,
        internationalAmount: 23,
        localCurrency: 'COP',
        internationalCurrency: 'USD',
        features: [
            'Certificado de Asistencia',
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
