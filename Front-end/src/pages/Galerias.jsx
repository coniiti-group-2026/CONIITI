import useContentSection from '../hooks/useContentSection';
import styles from '../styles/pages/DynamicPage.module.css';


export default function Galerias() {
    const { items: photos, loading } = useContentSection('galerias');

    return (
        <div className={styles.page}>
            <div className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1>Galerías de fotos</h1>
                    <p>Revive los mejores momentos de las ediciones del Congreso CONIITI.</p>
                </div>
            </div>

            <div className={styles.container}>
                {loading ? (
                    <div className={styles.empty}>
                        <h3>Cargando</h3>
                        <p>Estamos preparando el contenido para ti.</p>
                    </div>
                ) : photos.length === 0 ? (
                    <div className={styles.empty}>
                        <h3>Próximamente</h3>
                        <p>Aún no hay fotos disponibles en la galería.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                        {photos.map((photo) => (
                            <div
                                key={photo.id}
                                style={{
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    background: '#fff',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                    border: '1px solid #eee',
                                }}
                            >
                                <img
                                    src={photo.image_url}
                                    alt={photo.title}
                                    style={{ width: '100%', height: '250px', objectFit: 'cover', display: 'block' }}
                                    loading="lazy"
                                />
                                <div style={{ padding: '1rem' }}>
                                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#212529' }}>{photo.title}</h3>
                                    {photo.description && <p style={{ margin: 0, color: '#6c757d', fontSize: '0.9rem' }}>{photo.description}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
