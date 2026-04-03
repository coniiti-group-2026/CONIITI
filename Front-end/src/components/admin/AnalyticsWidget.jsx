import { useState, useEffect } from 'react';
import { getAnalyticsStats } from '../../services/microservicesApi';
import { FiPieChart, FiActivity } from 'react-icons/fi';

export default function AnalyticsWidget() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        getAnalyticsStats()
            .then(data => setStats(data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div style={{ padding: '20px' }}>Cargando analíticas...</div>;
    if (error) return <div style={{ padding: '20px', color: 'red' }}>Error cargando dashboard: {error}</div>;

    return (
        <div style={{ padding: '20px', background: '#1e293b', color: 'white', borderRadius: '12px', marginTop: '20px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 15px 0' }}>
                <FiActivity /> Dashboard de Estadísticas Globales
            </h3>
            
            <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ background: '#334155', padding: '20px', borderRadius: '8px', minWidth: '200px', textAlign: 'center' }}>
                    <h4 style={{ margin: 0, color: '#94a3b8' }}>Eventos Registrados</h4>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '10px 0 0 0' }}>
                        {stats?.total_events_logged || 0}
                    </p>
                </div>
                
                {/* Desglose por tipo */}
                <div style={{ flex: 1, background: '#334155', padding: '20px', borderRadius: '8px' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#94a3b8' }}><FiPieChart /> Desglose Asíncrono</h4>
                    {stats?.breakdown_by_type?.length > 0 ? (
                        <ul style={{ paddingLeft: '20px', margin: 0 }}>
                            {stats.breakdown_by_type.map((item, idx) => (
                                <li key={idx}><strong>{item._id}:</strong> {item.count}</li>
                            ))}
                        </ul>
                    ) : (
                        <p style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>Aún no hay mensajes en RabbitMQ</p>
                    )}
                </div>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '15px', textAlign: 'right' }}>
                *Datos proveídos por analytics-service (MongoDB)
            </p>
        </div>
    );
}
