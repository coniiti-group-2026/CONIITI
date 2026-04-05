import { useEffect, useState } from 'react';
import { FiActivity, FiPieChart } from 'react-icons/fi';

import { getAnalyticsStats } from '../../services/analyticsService';


const EVENT_LABELS = {
    'usuario.registrado': 'Registros de usuarios',
    'user.registered': 'Registros de usuarios',
    'otp.enviado': 'Códigos enviados',
    'otp.sent': 'Códigos enviados',
    'notification.sent': 'Notificaciones enviadas',
    'notificacion.enviada': 'Notificaciones enviadas',
    'session.created': 'Sesiones creadas',
    'session.updated': 'Sesiones actualizadas',
    'speaker.updated': 'Cambios en ponentes',
    'checkout.created': 'Pagos iniciados',
    'payment.created': 'Pagos iniciados',
};

export function formatEventLabel(value) {
    const normalized = String(value ?? '').trim().toLowerCase();

    if (!normalized) {
        return 'Otros movimientos';
    }

    if (EVENT_LABELS[normalized]) {
        return EVENT_LABELS[normalized];
    }

    const readable = normalized.replace(/[._-]+/g, ' ').trim();
    return readable.charAt(0).toUpperCase() + readable.slice(1);
}

export default function AnalyticsWidget({ stats, loading = false, error = '' }) {
    if (loading) {
        return <div style={{ padding: '1rem', color: '#64748b' }}>Cargando resumen...</div>;
    }

    if (error) {
        return <div style={{ padding: '1rem', color: '#dc2626' }}>No pudimos cargar este bloque: {error}</div>;
    }

    const analytics = stats ?? null;

    if (!analytics) {
        return <DeferredAnalyticsWidget />;
    }

    return (
        <div
            style={{
                padding: '1.25rem',
                background: 'white',
                color: '#0f172a',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.04)',
            }}
        >
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 0.85rem 0' }}>
                <FiActivity /> Panorama general
            </h3>

            <div style={{ display: 'grid', gap: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center' }}>
                    <span style={{ color: '#64748b' }}>Registros recientes</span>
                    <strong style={{ fontSize: '1.4rem' }}>{analytics.total_events_logged ?? 0}</strong>
                </div>

                <div>
                    <p style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748b', margin: '0 0 0.5rem 0' }}>
                        <FiPieChart /> Distribución por tipo
                    </p>
                    {analytics.breakdown_by_type?.length ? (
                        <ul style={{ margin: 0, paddingLeft: '1.1rem', color: '#334155' }}>
                            {analytics.breakdown_by_type.map((item) => (
                                <li key={item._id}>
                                    <strong>{formatEventLabel(item._id)}</strong>: {item.count}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                            Todavía no hay movimientos para mostrar.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

function DeferredAnalyticsWidget() {
    const [state, setState] = useState({
        stats: null,
        loading: true,
        error: '',
    });

    useEffect(() => {
        let isCancelled = false;

        getAnalyticsStats()
            .then((stats) => {
                if (!isCancelled) {
                    setState({ stats, loading: false, error: '' });
                }
            })
            .catch((error) => {
                if (!isCancelled) {
                    setState({ stats: null, loading: false, error: error.message });
                }
            });

        return () => {
            isCancelled = true;
        };
    }, []);

    return <AnalyticsWidget stats={state.stats} loading={state.loading} error={state.error} />;
}
