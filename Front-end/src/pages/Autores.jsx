import styles from '../styles/pages/DynamicPage.module.css';
import PersonCard from '../components/PersonCard';
import { getContentSection } from '../services/contentService';


export default function Autores() {
    const authors = getContentSection('autores');

    return (
        <div className={styles.page}>
            <div className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1>Autores e Investigadores</h1>
                    <p>Investigadores, estudiantes y docentes aportando conocimiento e innovacion.</p>
                </div>
            </div>

            <div className={styles.container}>
                {authors.length === 0 ? (
                    <div className={styles.empty}>
                        <h3>Proximamente</h3>
                        <p>Aun no hay perfiles disponibles para esta seccion.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                        {authors.map((author) => (
                            <PersonCard key={author.id} person={author} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
