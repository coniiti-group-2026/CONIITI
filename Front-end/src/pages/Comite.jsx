import { useEffect, useState } from 'react';

import { fetchCommitteeMembers, getCommitteeFallback } from '../services/committeeService';
import styles from '../styles/pages/DynamicPage.module.css';
import PersonCard from '../components/PersonCard';


export default function Comite() {
    const [members, setMembers] = useState(() => getCommitteeFallback());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;

        async function loadMembers() {
            setLoading(true);
            setError('');
            try {
                const data = await fetchCommitteeMembers();
                if (!cancelled) {
                    setMembers(data);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.message);
                    setMembers(getCommitteeFallback());
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadMembers();
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <div className={styles.page}>
            <div className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1>Miembros del comité</h1>
                    <p>Conoce al equipo técnico, científico y organizador detrás de CONIITI.</p>
                </div>
            </div>

            <div className={styles.container}>
                {error && (
                    <div className={styles.empty}>
                        <h3>Modo local sin API</h3>
                        <p>{error}</p>
                    </div>
                )}
                {loading ? (
                    <div className={styles.empty}>
                        <h3>Cargando</h3>
                        <p>Estamos preparando el contenido para ti.</p>
                    </div>
                ) : members.length === 0 ? (
                    <div className={styles.empty}>
                        <h3>Próximamente</h3>
                        <p>Aún no hay perfiles disponibles para esta sección.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                        {members.map((member) => (
                            <PersonCard key={member.id} person={member} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
