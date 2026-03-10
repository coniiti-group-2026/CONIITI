import { useState, useEffect } from 'react';
import styles from '../styles/pages/DynamicPage.module.css';
import PersonCard from '../components/PersonCard';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export default function Conferencistas() {
    const [speakers, setSpeakers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSpeakers = async () => {
            try {
                const res = await fetch(`${API_BASE}/cms/cards/conferencistas?active_only=true`);
                if (res.ok) setSpeakers(await res.json());
            } catch (e) {
                console.error("Error loading conferencistas:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchSpeakers();
    }, []);

    return (
        <div className={styles.page}>
            <div className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1>Oradores Principales</h1>
                    <p>Conoce a nuestros conferencistas invitados de honor de nuestro XI Congreso CONIITI.</p>
                </div>
            </div>

            <div className={styles.container}>
                {loading ? (
                    <div className={styles.loader}>Cargando información...</div>
                ) : speakers.length === 0 ? (
                    <div className={styles.empty}>
                        <h3>Próximamente</h3>
                        <p>Aún no hay perfiles disponibles para esta sección.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                        {speakers.map(speaker => (
                            <PersonCard key={speaker.id} person={speaker} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
