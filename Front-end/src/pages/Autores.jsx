import { useState, useEffect } from 'react';
import styles from '../styles/pages/DynamicPage.module.css';
import PersonCard from '../components/PersonCard';

const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

export default function Autores() {
    const [authors, setAuthors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAuthors = async () => {
            try {
                const res = await fetch(`${API_BASE}/cms/cards/autores?active_only=true`);
                if (res.ok) setAuthors(await res.json());
            } catch (e) {
                console.error("Error loading autores:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchAuthors();
    }, []);

    return (
        <div className={styles.page}>
            <div className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1>Autores e Investigadores</h1>
                    <p>Investigadores, estudiantes y docentes aportando conocimiento e innovación.</p>
                </div>
            </div>

            <div className={styles.container}>
                {loading ? (
                    <div className={styles.loader}>Cargando información...</div>
                ) : authors.length === 0 ? (
                    <div className={styles.empty}>
                        <h3>Próximamente</h3>
                        <p>Aún no hay perfiles disponibles para esta sección.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                        {authors.map(author => (
                            <PersonCard key={author.id} person={author} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
