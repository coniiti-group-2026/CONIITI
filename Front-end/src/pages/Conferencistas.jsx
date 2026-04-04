// Conferencistas.jsx
// Pagina de conferencistas del congreso CONIITI.

import { useState, useEffect } from 'react';
import SpeakerCard from '../components/SpeakerCard';
import pageStyles from '../styles/pages/DynamicPage.module.css';
import styles from '../styles/pages/Conferencistas.module.css';

const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

const FILTERS = [
    { value: 'todos', label: 'Todos los Conferencistas' },
    { value: 'principal', label: 'Conferencistas Principales' },
];

/** Pagina de conferencistas invitados del congreso. */
export default function Conferencistas() {
    const [speakers, setSpeakers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('todos');

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            setLoading(true);
            setSpeakers([]);
            
            const url = filter === 'principal'
                ? `${API_BASE}/agenda/speakers?principal_only=true`
                : `${API_BASE}/agenda/speakers`;

            try {
                const r = await fetch(url);
                const data = r.ok ? await r.json() : [];
                if (isMounted) setSpeakers(data);
            } catch {
                if (isMounted) setSpeakers([]);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchData();

        return () => { isMounted = false; };
    }, [filter]);

    return (
        <div className={pageStyles.page}>
            {/* Hero */}
            <div className={pageStyles.hero}>
                <div className={pageStyles.heroContent}>
                    <h1>Oradores Principales</h1>
                    <p>Conoce a nuestros conferencistas invitados de honor del XI Congreso CONIITI.</p>
                </div>
            </div>

            <div className={pageStyles.container}>
                {/* Filtros */}
                <div className={styles.filters}>
                    {FILTERS.map(f => (
                        <button
                            key={f.value}
                            onClick={() => setFilter(f.value)}
                            className={`${styles.filterBtn} ${filter === f.value ? styles.filterBtnActive : ''}`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Estado de carga */}
                {loading && <div className={pageStyles.loader}>Cargando informacion...</div>}

                {/* Estado vacio */}
                {!loading && speakers.length === 0 && (
                    <div className={pageStyles.empty}>
                        <h3>Proximamente</h3>
                        <p>Aun no hay perfiles disponibles para esta seccion.</p>
                    </div>
                )}

                {/* Grid de tarjetas */}
                {!loading && speakers.length > 0 && (
                    <div className={styles.grid}>
                        {speakers.map((sp, i) => (
                            <SpeakerCard key={sp.ponente + i} speaker={sp} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
