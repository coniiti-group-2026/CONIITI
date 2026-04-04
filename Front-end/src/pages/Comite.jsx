import { useState, useEffect } from 'react';
import styles from '../styles/pages/DynamicPage.module.css';
import PersonCard from '../components/PersonCard';

const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

export default function Comite() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const res = await fetch(`${API_BASE}/cms/cards/comite?active_only=true`);
                if (res.ok) setMembers(await res.json());
            } catch (e) {
                console.error("Error loading comite:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchMembers();
    }, []);

    return (
        <div className={styles.page}>
            <div className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1>Miembros del Comité</h1>
                    <p>Conoce al equipo técnico, científico y organizador detrás de CONIITI.</p>
                </div>
            </div>

            <div className={styles.container}>
                {loading ? (
                    <div className={styles.loader}>Cargando información...</div>
                ) : members.length === 0 ? (
                    <div className={styles.empty}>
                        <h3>Próximamente</h3>
                        <p>Aún no hay perfiles disponibles para esta sección.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                        {members.map(member => (
                            <PersonCard key={member.id} person={member} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
