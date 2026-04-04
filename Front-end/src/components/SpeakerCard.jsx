// SpeakerCard.jsx
// Tarjeta individual de conferencista para la pagina de Conferencistas e Inicio.

import { useState } from 'react';
import { FiUser, FiBriefcase, FiFileText } from 'react-icons/fi';
import SpeakerModal from './SpeakerModal';
import styles from '../styles/components/SpeakerCard.module.css';

/**
 * Tarjeta de ponente con foto, afiliacion, bio y sesiones.
 * @param {{ speaker: object }} props
 */
export default function SpeakerCard({ speaker }) {
    const [showModal, setShowModal] = useState(false);
    const { ponente, afiliacion, descripcion_ponente, foto_ponente_url, es_conferencista_principal, sessions = [] } = speaker;

    // Limite visual aproximado de caracteres para truncar la biografia y mantener cuadratura
    const MAX_BIO_LENGTH = 125;
    const isLongDescription = descripcion_ponente && descripcion_ponente.length > MAX_BIO_LENGTH;
    const displayBio = isLongDescription 
        ? `${descripcion_ponente.substring(0, MAX_BIO_LENGTH)}...` 
        : descripcion_ponente;

    return (
        <>
            <div className={styles.card}>
                {/* Insignia de principal */}
                {es_conferencista_principal && (
                    <span className={styles.badge}>Principal</span>
                )}

                {/* Foto / avatar */}
                <div className={styles.photo}>
                    {foto_ponente_url
                        ? <img src={foto_ponente_url} alt={ponente} loading="lazy" />
                        : <span className={styles.avatar}>{ponente?.charAt(0)?.toUpperCase()}</span>
                    }
                </div>

                {/* Datos */}
                <div className={styles.body}>
                    <h3 className={styles.name}>
                        <FiUser className={styles.iconBlue} />
                        <span>{ponente}</span>
                    </h3>

                    {afiliacion && (
                        <p className={styles.affiliation}>
                            <FiBriefcase className={styles.iconGray} />
                            <span>{afiliacion}</span>
                        </p>
                    )}

                    {descripcion_ponente && (
                        <div className={styles.bioContainer}>
                            <FiFileText className={styles.iconGold} />
                            <p className={styles.bio}>
                                {displayBio}{' '}
                                {isLongDescription && (
                                    <button 
                                        className={styles.verMasBtn} 
                                        onClick={() => setShowModal(true)}
                                    >
                                        Ver más
                                    </button>
                                )}
                            </p>
                        </div>
                    )}

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

            {/* Modal para ver todos los detalles (se porta a full screen sobre root) */}
            {showModal && (
                <SpeakerModal 
                    speaker={speaker} 
                    onClose={() => setShowModal(false)}
                />
            )}
        </>
    );
}
