import {
    FiClock,
    FiMapPin,
    FiUser,
    FiMonitor,
    FiRefreshCw,
} from 'react-icons/fi';
import StatusBadge from './StatusBadge';
import VirtualGatekeeper from './VirtualGatekeeper';
import styles from '../styles/components/SessionCard.module.css';
import { FiCalendar, FiCheckCircle } from 'react-icons/fi';
import { useState } from 'react';

/**
 * SessionCard — renderiza una sesión de agenda con todos los detalles.
 *
 * @param {{ session: import('../types/session').Session, index: number, onSpeakerClick: Function }} props
 */
export default function SessionCard({ session, index, onSpeakerClick, isRegistered = false, onToggleRegister, mode = 'agenda' }) {
    const {
        titulo,
        ponente,
        afiliacion,
        track,
        hora_inicio,
        hora_fin,
        salon,
        salon_anterior,
        modalidad,
        status_logistico,
        link_verificado,
        link_virtual,
        timestamp_actualizacion,
        descripcion,
    } = session;

    const lastUpdated = new Date(timestamp_actualizacion).toLocaleTimeString(
        'es-CO',
        { hour: '2-digit', minute: '2-digit' }
    );

    // Estado controlado externamente desde App.jsx

    return (
        <article
            className={styles.card}
            style={{ animationDelay: `${index * 80}ms` }}
        >
            <div className={styles.accentBar} />

            <div className={styles.body}>
                {/* Track + Estado */}
                <div className={styles.topRow}>
                    <span className={styles.track}>{track}</span>
                    <StatusBadge
                        status={status_logistico}
                        timestamp={timestamp_actualizacion}
                        salonAnterior={salon_anterior}
                    />
                </div>

                {/* Título */}
                <h3 className={styles.title}>{titulo}</h3>

                {/* Descripción */}
                <p className={styles.description}>{descripcion}</p>

                {/* Información meta */}
                <div className={styles.metaGrid}>
                    <div className={styles.metaItem}>
                        <FiClock className={styles.metaIcon} />
                        <div>
                            <div className={styles.metaLabel}>Horario</div>
                            <div className={styles.metaValue}>
                                {hora_inicio} – {hora_fin}
                            </div>
                        </div>
                    </div>

                    <div className={styles.metaItem}>
                        <FiMapPin className={styles.metaIcon} />
                        <div>
                            <div className={styles.metaLabel}>Salón</div>
                            <div className={styles.metaValue}>{salon}</div>
                        </div>
                    </div>

                    <div className={styles.metaItem}>
                        <FiUser className={styles.metaIcon} />
                        <div>
                            <div className={styles.metaLabel}>Ponente</div>
                            <button
                                className={styles.speakerLink}
                                onClick={() => onSpeakerClick(session.speaker_id)}
                                title="Ver perfil del ponente"
                            >
                                {ponente}
                            </button>
                            <div className={styles.timestamp}>{afiliacion}</div>
                        </div>
                    </div>


                    <div className={styles.metaItem}>
                        <FiMonitor className={styles.metaIcon} />
                        <div>
                            <div className={styles.metaLabel}>Modalidad</div>
                            <div className={styles.metaValue}>{modalidad}</div>
                        </div>
                    </div>
                </div>

                {/* Pie: Enlace virtual + marca de tiempo */}
                <div className={styles.footer}>
                    <VirtualGatekeeper
                        modalidad={modalidad}
                        linkVirtual={link_virtual}
                        linkVerificado={link_verificado}
                    />

                    <span className={styles.timestamp}>
                        <FiRefreshCw size={12} />
                        Actualizado: {lastUpdated}
                    </span>
                </div>
            </div>

            {/* Botón pre-inscripción / validar asistencia */}
            {mode === 'mis-conferencias' ? (
                <button className={styles.validateBtn}>
                    <FiCheckCircle /> Validar asistencia
                </button>
            ) : (
                <button
                    className={isRegistered ? styles.registeredBtn : styles.registerBtn}
                    onClick={() => onToggleRegister && onToggleRegister(session.id)}
                >
                    {isRegistered
                        ? <><FiCheckCircle /> Pre-inscrito</>
                        : <><FiCalendar /> Pre-inscribirse</>
                    }
                </button>
            )}
        </article>
    );
}
