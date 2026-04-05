import { useState } from 'react';
import { FiDownload } from 'react-icons/fi';

import useContentSection from '../hooks/useContentSection';
import styles from '../styles/pages/DynamicPage.module.css';


export default function Memorias() {
    const { items: memorias, loading } = useContentSection('memorias');
    const [viewingDesc, setViewingDesc] = useState(null);

    const grouped = memorias.reduce((acc, curr) => {
        const year = curr.year || 'Sin año';
        if (!acc[year]) acc[year] = [];
        acc[year].push(curr);
        return acc;
    }, {});

    const sortedYears = Object.keys(grouped).sort((a, b) => {
        if (a === 'Sin año') return 1;
        if (b === 'Sin año') return -1;
        return Number(b) - Number(a);
    });

    return (
        <div className={styles.page}>
            <div className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1>Memorias del Congreso</h1>
                    <p>Descarga y revisa las ponencias y la documentación entregada a lo largo del congreso.</p>
                </div>
            </div>

            <div className={styles.container}>
                {loading ? (
                    <div className={styles.empty}>
                        <h3>Cargando</h3>
                        <p>Estamos preparando el contenido para ti.</p>
                    </div>
                ) : memorias.length === 0 ? (
                    <div className={styles.empty}>
                        <h3>Próximamente</h3>
                        <p>Aún no hay memorias disponibles para descargar.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                        {sortedYears.map((year) => (
                            <div key={year}>
                                <h2 style={{ paddingBottom: '0.5rem', borderBottom: '2px solid #e9ecef', marginBottom: '1.5rem', color: '#001f3f' }}>
                                    Edición {year}
                                </h2>
                                <div className={styles.grid}>
                                    {grouped[year].map((item) => (
                                        <div key={item.id} className={styles.card} style={{ padding: '0', display: 'flex', flexDirection: 'column' }}>
                                            {item.image_url && (
                                                <img src={item.image_url} alt={item.title} className={styles.cardImg} style={{ margin: '0', borderRadius: '12px 12px 0 0' }} />
                                            )}
                                            <div className={styles.cardBody} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                                <h3 style={{ marginBottom: '0.1rem' }}>{item.title}</h3>
                                                {item.year && <p className={styles.yearBadge}>{item.year}</p>}

                                                <div className={styles.descWrapper}>
                                                    <p className={styles.cardDesc}>
                                                        {item.description?.length > 100 ? `${item.description.substring(0, 100)}... ` : item.description}
                                                    </p>
                                                    {item.description?.length > 100 && (
                                                        <button className={styles.readMoreBtn} onClick={() => setViewingDesc(item.description)}>
                                                            Ver más
                                                        </button>
                                                    )}
                                                </div>

                                                {item.link_url && (
                                                    <a
                                                        href={item.link_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={styles.linkBtn}
                                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: 'auto' }}
                                                    >
                                                        <FiDownload /> Abrir memorias
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {viewingDesc && (
                <div className={styles.overlay} onClick={() => setViewingDesc(null)}>
                    <div className={styles.readModal} onClick={(e) => e.stopPropagation()}>
                        <h3>Descripción completa</h3>
                        <p className={styles.readText}>{viewingDesc}</p>
                        <div className={styles.modalFoot}>
                            <button type="button" onClick={() => setViewingDesc(null)}>Cerrar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
