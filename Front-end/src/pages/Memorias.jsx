import { useState, useEffect } from 'react';
import styles from '../styles/pages/DynamicPage.module.css';
import { FiDownload } from 'react-icons/fi';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export default function Memorias() {
    const [memorias, setMemorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewingDesc, setViewingDesc] = useState(null);

    useEffect(() => {
        const fetchMemorias = async () => {
            try {
                const res = await fetch(`${API_BASE}/cms/cards/memorias?active_only=true`);
                if (res.ok) setMemorias(await res.json());
            } catch (e) {
                console.error("Error loading memorias:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchMemorias();
    }, []);

    // Agrupar por año
    const grouped = memorias.reduce((acc, curr) => {
        const y = curr.year || 'Sin Año';
        if (!acc[y]) acc[y] = [];
        acc[y].push(curr);
        return acc;
    }, {});

    // Ordenar años de mayor a menor
    const sortedYears = Object.keys(grouped).sort((a, b) => {
        if (a === 'Sin Año') return 1;
        if (b === 'Sin Año') return -1;
        return parseInt(b) - parseInt(a);
    });

    return (
        <div className={styles.page}>
            <div className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1>Memorias del Congreso</h1>
                    <p>Descarga y revisa las ponencias, certificados y documentación entregada a lo largo del congreso.</p>
                </div>
            </div>

            <div className={styles.container}>
                {loading ? (
                    <div className={styles.loader}>Cargando información...</div>
                ) : memorias.length === 0 ? (
                    <div className={styles.empty}>
                        <h3>Próximamente</h3>
                        <p>Aún no hay memorias disponibles para descargar.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                        {sortedYears.map(year => (
                            <div key={year}>
                                <h2 style={{ paddingBottom: '0.5rem', borderBottom: '2px solid #e9ecef', marginBottom: '1.5rem', color: '#001f3f' }}>
                                    Edición {year}
                                </h2>
                                <div className={styles.grid}>
                                    {grouped[year].map(item => (
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
                                                        <button 
                                                            className={styles.readMoreBtn} 
                                                            onClick={() => setViewingDesc(item.description)}
                                                        >
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
                                                        <FiDownload /> Descargar Documento
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
                    <div className={styles.readModal} onClick={e => e.stopPropagation()}>
                        <h3>Descripción Completa</h3>
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
