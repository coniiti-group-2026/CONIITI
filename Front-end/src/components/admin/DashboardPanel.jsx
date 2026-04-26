import { useEffect, useMemo, useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { FiActivity, FiBell, FiCalendar, FiUsers } from 'react-icons/fi';

import AnalyticsWidget from './AnalyticsWidget';
import { formatEventLabel } from '../../utils/analyticsUtils';
import { getAnalyticsStats, getNotificationEvents } from '../../services/analyticsService';
import { getSessions } from '../../services/agendaService';
import { listStaff } from '../../services/userService';
import styles from '../../styles/components/DashboardPanel.module.css';


const COLORS = ['#0d6efd', '#0ea5a4', '#f59e0b', '#ef4444', '#6366f1', '#14b8a6'];

function buildSessionSummary(sessions) {
    const byModality = {};
    const byTrack = {};

    sessions.forEach((session) => {
        byModality[session.modalidad] = (byModality[session.modalidad] ?? 0) + 1;
        byTrack[session.track] = (byTrack[session.track] ?? 0) + 1;
    });

    return {
        byModality: Object.entries(byModality).map(([name, value]) => ({ name, value })),
        byTrack: Object.entries(byTrack)
            .map(([name, value]) => ({ name, value }))
            .sort((left, right) => right.value - left.value)
            .slice(0, 6),
    };
}

function formatEventDate(value) {
    if (!value) return '-';
    return new Intl.DateTimeFormat('es-CO', {
        dateStyle: 'short',
        timeStyle: 'short',
    }).format(new Date(value));
}

export default function DashboardPanel() {
    const [analytics, setAnalytics] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [staffMembers, setStaffMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let isCancelled = false;

        const load = async () => {
            setLoading(true);
            setError('');

            try {
                const [analyticsData, notificationsData, sessionsData, staffData] = await Promise.all([
                    getAnalyticsStats(),
                    getNotificationEvents(10),
                    getSessions(),
                    listStaff(),
                ]);

                if (!isCancelled) {
                    setAnalytics(analyticsData);
                    setNotifications(notificationsData?.events ?? []);
                    setSessions(Array.isArray(sessionsData) ? sessionsData : []);
                    setStaffMembers(Array.isArray(staffData) ? staffData : []);
                }
            } catch (err) {
                if (!isCancelled) {
                    setError(err.message);
                }
            } finally {
                if (!isCancelled) {
                    setLoading(false);
                }
            }
        };

        load();

        return () => {
            isCancelled = true;
        };
    }, []);

    const analyticsBreakdown = useMemo(
        () => (analytics?.breakdown_by_type ?? []).map((item) => ({ name: formatEventLabel(item._id), value: item.count })),
        [analytics]
    );

    const sessionSummary = useMemo(() => buildSessionSummary(sessions), [sessions]);

    if (loading) {
        return <div className={styles.loading}>Cargando resumen...</div>;
    }

    if (error) {
        return <div className={styles.error}>No pudimos cargar el resumen: {error}</div>;
    }

    return (
        <div className={styles.dashboardContainer}>
            <div className={styles.header}>
                <h2>Resumen general</h2>
                <p>Consulta en un solo lugar la actividad del congreso, la programación y el estado del equipo.</p>
            </div>

            <div className={styles.kpiGrid}>
                <div className={styles.kpiCard}>
                    <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
                        <FiActivity size={24} />
                    </div>
                    <div className={styles.kpiInfo}>
                        <h4>Actividad registrada</h4>
                        <span>{analytics?.total_events_logged ?? 0}</span>
                    </div>
                </div>

                <div className={styles.kpiCard}>
                    <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#eef2ff', color: '#4f46e5' }}>
                        <FiCalendar size={24} />
                    </div>
                    <div className={styles.kpiInfo}>
                        <h4>Sesiones programadas</h4>
                        <span>{sessions.length}</span>
                    </div>
                </div>

                <div className={styles.kpiCard}>
                    <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>
                        <FiUsers size={24} />
                    </div>
                    <div className={styles.kpiInfo}>
                        <h4>Equipo de apoyo</h4>
                        <span>{staffMembers.length}</span>
                    </div>
                </div>

                <div className={styles.kpiCard}>
                    <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#fff7ed', color: '#ea580c' }}>
                        <FiBell size={24} />
                    </div>
                    <div className={styles.kpiInfo}>
                        <h4>Alertas recientes</h4>
                        <span>{notifications.length}</span>
                    </div>
                </div>
            </div>

            <AnalyticsWidget stats={analytics} />

            <div className={styles.chartsGrid}>
                <div className={styles.chartCard}>
                    <h3>Actividad por tipo</h3>
                    <div className={styles.chartWrapper}>
                        {analyticsBreakdown.length === 0 ? (
                            <div className={styles.loading}>Aún no hay actividad registrada.</div>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={analyticsBreakdown}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={4}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {analyticsBreakdown.map((entry, index) => (
                                            <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip formatter={(value) => [`${value} registros`, 'Cantidad']} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                <div className={styles.chartCard}>
                    <h3>Sesiones por modalidad</h3>
                    <div className={styles.chartWrapper}>
                        {sessionSummary.byModality.length === 0 ? (
                            <div className={styles.loading}>No hay sesiones creadas todavía.</div>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={sessionSummary.byModality}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis allowDecimals={false} />
                                    <RechartsTooltip formatter={(value) => [`${value} sesiones`, 'Cantidad']} />
                                    <Legend />
                                    <Bar dataKey="value" name="Sesiones" fill="#0d6efd" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                <div className={`${styles.chartCard} ${styles.fullWidth}`}>
                    <h3>Temas con mayor movimiento</h3>
                    <div className={styles.chartWrapper}>
                        {sessionSummary.byTrack.length === 0 ? (
                            <div className={styles.loading}>Aún no hay temas para mostrar.</div>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={sessionSummary.byTrack} layout="vertical" margin={{ left: 16, right: 24 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" allowDecimals={false} />
                                    <YAxis type="category" dataKey="name" width={170} />
                                    <RechartsTooltip formatter={(value) => [`${value} sesiones`, 'Cantidad']} />
                                    <Bar dataKey="value" name="Sesiones" radius={[0, 4, 4, 0]}>
                                        {sessionSummary.byTrack.map((entry, index) => (
                                            <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>

            <div className={styles.eventsCard}>
                <div className={styles.eventsHeader}>
                    <h3>Últimos 10 eventos de RabbitMQ</h3>
                    <span>{notifications.length} eventos</span>
                </div>

                {notifications.length === 0 ? (
                    <div className={styles.emptyEvents}>Aún no hay eventos registrados.</div>
                ) : (
                    <div className={styles.eventsList}>
                        {notifications.map((event) => (
                            <div className={styles.eventItem} key={event.event_id}>
                                <div className={styles.eventMeta}>
                                    <span className={styles.routingKey}>{formatEventLabel(event.routing_key)}</span>
                                    <span className={styles.eventStatus}>{event.status}</span>
                                    <time>{formatEventDate(event.processed_at)}</time>
                                </div>
                                <p>{event.action_summary}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
