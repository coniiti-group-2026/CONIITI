import useContentSection from '../hooks/useContentSection';
import styles from '../styles/pages/DynamicPage.module.css';
import PersonCard from '../components/PersonCard';


export default function Autores() {
    const { items: authors, loading } = useContentSection('autores');

    return (
        <div className={styles.page}>
            <div className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1>Autores e Investigadores</h1>
                    <p>Investigadores, estudiantes y docentes que aportan conocimiento e innovación.</p>
                </div>
            </div>

            <div className={styles.container}>
                {loading ? (
                    <div className={styles.empty}>
                        <h3>Cargando</h3>
                        <p>Estamos preparando el contenido para ti.</p>
                    </div>
                ) : authors.length === 0 ? (
                    <div className={styles.empty}>
                        <h3>Próximamente</h3>
                        <p>Aún no hay perfiles disponibles para esta sección.</p>
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
