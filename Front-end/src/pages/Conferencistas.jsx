import { useState, useEffect } from 'react';

import SpeakerCard from '../components/SpeakerCard';
import { getApiBase } from '../services/apiConfig';
import pageStyles from '../styles/pages/DynamicPage.module.css';
import styles from '../styles/pages/Conferencistas.module.css';

const API_BASE = getApiBase();

const FILTERS = [
    { value: 'todos', label: 'Todos los conferencistas' },
    { value: 'principal', label: 'Conferencistas principales' },
];

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
                const response = await fetch(url);
                const data = response.ok ? await response.json() : [];
                if (isMounted) setSpeakers(data);
            } catch {
                if (isMounted) setSpeakers([]);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [filter]);

    return (
        <div className={pageStyles.page}>
            <div className={pageStyles.hero}>
                <div className={pageStyles.heroContent}>
                    <h1>Conferencistas principales</h1>
                    <p>Conoce a los conferencistas invitados de honor del XI Congreso CONIITI.</p>
                </div>
            </div>

            <div className={pageStyles.container}>
                <div className={styles.filters}>
                    {FILTERS.map((item) => (
                        <button
                            key={item.value}
                            onClick={() => setFilter(item.value)}
                            className={`${styles.filterBtn} ${filter === item.value ? styles.filterBtnActive : ''}`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                {loading && <div className={pageStyles.loader}>Cargando información...</div>}

                {!loading && speakers.length === 0 && (
                    <div className={pageStyles.empty}>
                        <h3>Próximamente</h3>
                        <p>Aún no hay perfiles disponibles para esta sección.</p>
                    </div>
                )}

                {!loading && speakers.length > 0 && (
                    <div className={styles.grid}>
                        {speakers.map((speaker, index) => (
                            <SpeakerCard key={speaker.ponente + index} speaker={speaker} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
