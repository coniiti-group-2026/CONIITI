import styles from '../styles/pages/DynamicPage.module.css';
import PersonCard from '../components/PersonCard';
import { getContentSection } from '../services/contentService';


export default function Comite() {
    const members = getContentSection('comite');

    return (
        <div className={styles.page}>
            <div className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1>Miembros del Comite</h1>
                    <p>Conoce al equipo tecnico, cientifico y organizador detras de CONIITI.</p>
                </div>
            </div>

            <div className={styles.container}>
                {members.length === 0 ? (
                    <div className={styles.empty}>
                        <h3>Proximamente</h3>
                        <p>Aun no hay perfiles disponibles para esta seccion.</p>
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
