import { FiExternalLink } from 'react-icons/fi';

import useContentSection from '../hooks/useContentSection';
import styles from '../styles/pages/DynamicPage.module.css';


export default function DynamicPage({ title, description, section }) {
    const { items: cards, loading } = useContentSection(section);

    return (
        <div className={styles.page}>
            <div className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1>{title}</h1>
                    <p>{description}</p>
                </div>
            </div>

            <div className={styles.container}>
                {loading ? (
                    <div className={styles.empty}>
                        <h3>Cargando</h3>
                        <p>Estamos preparando el contenido para ti.</p>
                    </div>
                ) : cards.length === 0 ? (
                    <div className={styles.empty}>
                        <h3>Próximamente</h3>
                        <p>Aún no hay información disponible para esta sección. Vuelve pronto.</p>
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {cards.map((card) => (
                            <div key={card.id} className={styles.card}>
                                {card.image_url && (
                                    <div className={styles.imgWrapper}>
                                        <img src={card.image_url} alt={card.title} loading="lazy" />
                                    </div>
                                )}
                                <div className={styles.cardBody}>
                                    <h3>{card.title}</h3>
                                    {card.description && <p>{card.description}</p>}
                                    {card.link_url && (
                                        <a href={card.link_url} target="_blank" rel="noopener noreferrer" className={styles.linkBtn}>
                                            Saber más <FiExternalLink />
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
