import { FiExternalLink } from 'react-icons/fi';

import styles from '../styles/pages/DynamicPage.module.css';
import { getContentSection } from '../services/contentService';


export default function DynamicPage({ title, description, section }) {
    const cards = getContentSection(section);

    return (
        <div className={styles.page}>
            <div className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1>{title}</h1>
                    <p>{description}</p>
                </div>
            </div>

            <div className={styles.container}>
                {cards.length === 0 ? (
                    <div className={styles.empty}>
                        <h3>Proximamente</h3>
                        <p>Aun no hay informacion disponible para esta seccion. Vuelve pronto.</p>
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
                                            Saber mas <FiExternalLink />
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
