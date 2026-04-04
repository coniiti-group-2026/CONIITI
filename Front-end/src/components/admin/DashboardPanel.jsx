import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '../../services/adminService';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { FiUsers, FiCalendar, FiMic, FiTrendingUp, FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi';
import styles from '../../styles/components/DashboardPanel.module.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
const SEGUNDARY_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#d0ed57', '#a4de6c'];

export default function DashboardPanel() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getDashboardStats();
                setStats(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className={styles.loading}>Cargando panel de estadísticas...</div>;
    if (error) return <div className={styles.error}>Error: {error}</div>;
    if (!stats) return null;

    // Preparar datos para las gráficas
    const userStatusData = [
        { name: 'Preinscritos', value: stats.usuarios.preinscritos_noverificados },
        { name: 'Validados (Sin cupo)', value: stats.usuarios.validados_sin_cupo },
        { name: 'Confirmados', value: stats.usuarios.confirmados_con_cupos }
    ];

    const capacityData = [
        { 
            name: 'Cupos del Evento', 
            Ofrecidos: stats.sesiones.cupos_totales_ofrecidos, 
            Realizadas: stats.sesiones.inscripciones_realizadas 
        }
    ];

    const topSpeakersData = stats.ponentes.top_asistencia.map(s => ({
        name: s.ponente.split(' ').slice(0, 2).join(' '), // Cortar nombres muy largos
        Asistentes: s.asistentes
    }));

    return (
        <div className={styles.dashboardContainer}>
            <div className={styles.header}>
                <h2>Métricas y Estadísticas Globales</h2>
                <p>Resumen analítico en tiempo real del sistema CONIITI</p>
            </div>

            {/* Tarjetas Superiores (KPIs) */}
            <div className={styles.kpiGrid}>
                <div className={styles.kpiCard}>
                    <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#e3f2fd', color: '#1976d2' }}>
                        <FiUsers size={24} />
                    </div>
                    <div className={styles.kpiInfo}>
                        <h4>Total Usuarios</h4>
                        <span>{stats.usuarios.total}</span>
                    </div>
                </div>
                
                <div className={styles.kpiCard}>
                    <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#e8f5e9', color: '#388e3c' }}>
                        <FiCheckCircle size={24} />
                    </div>
                    <div className={styles.kpiInfo}>
                        <h4>Inscripciones Realizadas</h4>
                        <span>{stats.sesiones.inscripciones_realizadas}</span>
                    </div>
                </div>

                <div className={styles.kpiCard}>
                    <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#fff3e0', color: '#f57c00' }}>
                        <FiCalendar size={24} />
                    </div>
                    <div className={styles.kpiInfo}>
                        <h4>Sesiones Creadas</h4>
                        <span>{stats.sesiones.total}</span>
                    </div>
                </div>

                <div className={styles.kpiCard}>
                    <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#f3e5f5', color: '#7b1fa2' }}>
                        <FiMic size={24} />
                    </div>
                    <div className={styles.kpiInfo}>
                        <h4>Ponentes Únicos</h4>
                        <span>{stats.ponentes.total_unicos}</span>
                    </div>
                </div>
            </div>

            <div className={styles.chartsGrid}>
                {/* Gráfica 1: Estado de Usuarios */}
                <div className={styles.chartCard}>
                    <h3>Estado de Participantes</h3>
                    <div className={styles.chartWrapper}>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={userStatusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {userStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip 
                                    formatter={(value) => [`${value} Usuarios`, 'Cantidad']}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Gráfica 2: Relación de Cupos */}
                <div className={styles.chartCard}>
                    <h3>Ocupación Global del Congreso</h3>
                    <div className={styles.chartWrapper}>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={capacityData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <RechartsTooltip />
                                <Legend />
                                <Bar dataKey="Ofrecidos" fill="#8884d8" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Realizadas" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Gráfica 3: Top Ponentes */}
                <div className={`${styles.chartCard} ${styles.fullWidth}`}>
                    <h3>Top 5 Ponentes por Asistencia</h3>
                    <div className={styles.chartWrapper}>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={topSpeakersData}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 13 }} />
                                <RechartsTooltip formatter={(value) => [`${value} registrados`, 'Asistencia']} />
                                <Bar dataKey="Asistentes" fill="#ffc658" radius={[0, 4, 4, 0]}>
                                    {topSpeakersData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={SEGUNDARY_COLORS[index % SEGUNDARY_COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
