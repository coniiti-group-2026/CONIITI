import useContentSection from '../hooks/useContentSection';
import styles from '../styles/pages/DynamicPage.module.css';
import PersonCard from '../components/PersonCard';


export default function Comite() {
    const { items: members, loading } = useContentSection('comite');

    return (
        <div className={styles.page}>
            <div className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1>Miembros del comité</h1>
                    <p>Conoce al equipo técnico, científico y organizador detrás de CONIITI.</p>
                </div>
            </div>

            <div className={styles.container}>
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
