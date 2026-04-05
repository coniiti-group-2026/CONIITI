import { useState } from 'react';
import styles from '../styles/components/PersonCard.module.css';
import SpeakerModal from './SpeakerModal';

export default function PersonCard({ person }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Mapear los datos de ContentCard al formato de SpeakerModal
    const speakerData = {
        id: person.id,
        ponente: person.title,
        afiliacion: person.subtitle,
        descripcion_ponente: person.description,
        foto_ponente_url: person.image_url
    };

    return (
        <>
            <div className={styles.card} onClick={() => setIsModalOpen(true)}>
                <div className={styles.imageWrapper}>
                    <img 
                        src={person.image_url || 'https://i.pravatar.cc/300?u=fallback'} 
                        alt={person.title} 
                        onError={(e) => { e.target.src = 'https://i.pravatar.cc/300?u=fallback'; }}
                    />
                </div>
                <div className={styles.info}>
                    <h3 className={styles.name}>{person.title}</h3>
                    {person.subtitle && <p className={styles.role}>{person.subtitle}</p>}
                </div>
            </div>

            {isModalOpen && (
                <SpeakerModal 
                    speaker={speakerData} 
                    onClose={() => setIsModalOpen(false)} 
                />
            )}
        </>
    );
}
