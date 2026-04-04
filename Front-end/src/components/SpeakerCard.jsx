// SpeakerCard.jsx
// Tarjeta individual de conferencista para la pagina de Conferencistas.

import styles from '../styles/components/SpeakerCard.module.css';

/**
 * Tarjeta de ponente con foto, afiliacion, bio y sesiones.
 * @param {{ speaker: object }} props
 */
export default function SpeakerCard({ speaker }) {
    const { ponente, afiliacion, descripcion_ponente, foto_ponente_url, es_conferencista_principal, sessions = [] } = speaker;

    return (
        <div className={styles.card}>
            {/* Insignia de principal */}
            {es_conferencista_principal && (
                <span className={styles.badge}>Principal</span>
            )}

            {/* Foto / avatar */}
            <div className={styles.photo}>
                {foto_ponente_url
                    ? <img src={foto_ponente_url} alt={ponente} />
                    : <span className={styles.avatar}>{ponente?.charAt(0)?.toUpperCase()}</span>
                }
            </div>

            {/* Datos */}
            <div className={styles.body}>
                <h3 className={styles.name}>{ponente}</h3>
                {afiliacion && <p className={styles.affiliation}>{afiliacion}</p>}
                {descripcion_ponente && <p className={styles.bio}>{descripcion_ponente}</p>}

                {sessions.length > 0 && (
                    <div className={styles.sessions}>
                        <p className={styles.sessionsLabel}>Sesiones</p>
                        {sessions.map((s, i) => (
                            <p key={i} className={styles.sessionItem}>{s.titulo}</p>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
