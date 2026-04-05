import { useState } from 'react';
import { FiUser, FiBriefcase, FiFileText } from 'react-icons/fi';

import SpeakerModal from './SpeakerModal';
import styles from '../styles/components/SpeakerCard.module.css';

export default function SpeakerCard({ speaker }) {
    const [showModal, setShowModal] = useState(false);
    const {
        ponente,
        afiliacion,
        descripcion_ponente,
        foto_ponente_url,
        es_conferencista_principal,
        sessions = speaker.sesiones ?? [],
    } = speaker;

    const MAX_BIO_LENGTH = 125;
    const isLongDescription = descripcion_ponente && descripcion_ponente.length > MAX_BIO_LENGTH;
    const displayBio = isLongDescription
        ? `${descripcion_ponente.substring(0, MAX_BIO_LENGTH)}...`
        : descripcion_ponente;

    return (
        <>
            <div className={styles.card}>
                {es_conferencista_principal && (
                    <span className={styles.badge}>Principal</span>
                )}

                <div className={styles.photo}>
                    {foto_ponente_url
                        ? <img src={foto_ponente_url} alt={ponente} loading="lazy" />
                        : <span className={styles.avatar}>{ponente?.charAt(0)?.toUpperCase()}</span>}
                </div>

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
                            {sessions.map((session, index) => (
                                <p key={index} className={styles.sessionItem}>{session.titulo}</p>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {showModal && (
                <SpeakerModal
                    speaker={speaker}
                    onClose={() => setShowModal(false)}
                />
            )}
        </>
    );
}
