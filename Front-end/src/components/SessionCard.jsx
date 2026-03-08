import {
    FiClock,
    FiMapPin,
    FiUser,
    FiMonitor,
    FiRefreshCw,
    FiCalendar,
    FiCheckCircle,
    FiUsers,
    FiAlertTriangle,
    FiLogIn,
} from 'react-icons/fi';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import StatusBadge from './StatusBadge';
import VirtualGatekeeper from './VirtualGatekeeper';
import styles from '../styles/components/SessionCard.module.css';

/** Colores de track: mapea el valor del enum a una clase CSS */
const TRACK_CLASS = {
    'Inteligencia Artificial': styles.trackIA,
    'Ciberseguridad': styles.trackCiber,
    'Internet de las Cosas': styles.trackIOT,
    'Desarrollo de Software': styles.trackDev,
    'Ciencia de Datos': styles.trackDatos,
    'Innovación y Tendencias': styles.trackInnova,
};

/** Clases para el badge de tipo de evento */
const EVENT_CLASS = {
    'Conferencia': styles.etConferencia,
    'Taller': styles.etTaller,
    'Simposio': styles.etSimposio,
    'Panel': styles.etPanel,
};

/** Calcula el % de ocupación y devuelve el estado visual */
function cuposInfo(totales = 0, inscritos = 0) {
    const disponibles = totales - inscritos;
    const pct = totales > 0 ? Math.round((inscritos / totales) * 100) : 0;
    let estado = 'disponible'; // verde
    if (pct >= 100) estado = 'lleno';
    else if (pct >= 80) estado = 'casi-lleno';
    return { disponibles, pct, estado };
}

/**
 * SessionCard — renderiza una sesión de agenda con todos los detalles.
 */
export default function SessionCard({
    session,
    index,
    onSpeakerClick,
    isRegistered = false,
    onToggleRegister,
    mode = 'agenda',
}) {
    const { user } = useContext(AuthContext);
    const [showAuthHint, setShowAuthHint] = useState(false);

    const {
        titulo,
        ponente,
        afiliacion,
        track,
        event_type,
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
        cupos_totales = 0,
        inscritos = 0,
    } = session;

    const lastUpdated = new Date(timestamp_actualizacion).toLocaleTimeString(
        'es-CO',
        { hour: '2-digit', minute: '2-digit' }
    );

    const { disponibles, pct, estado } = cuposInfo(cupos_totales, inscritos);
    const agotado = estado === 'lleno';

    /** Maneja el clic en Pre-inscribirse: bloquea si no hay sesión */
    const handleRegisterClick = () => {
        if (!user) {
            setShowAuthHint(true);
            setTimeout(() => setShowAuthHint(false), 4000);
            return;
        }
        if (!agotado && onToggleRegister) onToggleRegister(session.id);
    };

    return (
        <article
            className={`${styles.card} ${agotado ? styles.cardFull : ''}`}
            style={{ animationDelay: `${index * 80}ms` }}
        >
            {/* Barra de acento superior coloreada por track */}
            <div className={`${styles.accentBar} ${TRACK_CLASS[track] ?? ''}`} />

            <div className={styles.body}>
                {/* Track + Tipo de Evento + Estado logístico */}
                <div className={styles.topRow}>
                    <div className={styles.topLeft}>
                        <span className={`${styles.track} ${TRACK_CLASS[track] ?? ''}`}>
                            {track}
                        </span>
                        {event_type && (
                            <span className={`${styles.eventType} ${EVENT_CLASS[event_type] ?? ''}`}>
                                {event_type}
                            </span>
                        )}
                    </div>
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

                {/* Barra de cupos */}
                {cupos_totales > 0 && (
                    <div className={styles.cuposWrapper}>
                        <div className={styles.cuposHeader}>
                            <span className={styles.cuposLabel}>
                                <FiUsers size={13} />
                                Cupos
                            </span>
                            <span className={`${styles.cuposCount} ${styles[`cupos_${estado.replace('-', '')}`]}`}>
                                {agotado
                                    ? '⚠ Cupos agotados'
                                    : `${disponibles} de ${cupos_totales} disponibles`
                                }
                            </span>
                        </div>
                        <div className={styles.cuposBarBg}>
                            <div
                                className={`${styles.cuposBarFill} ${styles[`cuposFill_${estado.replace('-', '')}`]}`}
                                style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Grid de meta-datos */}
                <div className={styles.metaGrid}>
                    <div className={styles.metaItem}>
                        <FiClock className={styles.metaIcon} />
                        <div>
                            <div className={styles.metaLabel}>Horario</div>
                            <div className={styles.metaValue}>{hora_inicio} – {hora_fin}</div>
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
                                onClick={() => onSpeakerClick(session)}
                                title="Ver perfil del ponente"
                            >
                                {ponente}
                            </button>
                            <div className={styles.metaSubLabel}>{afiliacion}</div>
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

                {/* Pie: Enlace virtual + timestamp */}
                <div className={styles.footer}>
                    <VirtualGatekeeper
                        modalidad={modalidad}
                        linkVirtual={link_virtual}
                        linkVerificado={link_verificado}
                        isRegistered={isRegistered}
                    />
                    <span className={styles.timestamp}>
                        <FiRefreshCw size={12} />
                        Actualizado: {lastUpdated}
                    </span>
                </div>
            </div>

            {/* Botón pre-inscripción / validar asistencia */}
            {mode === 'mis-conferencias' ? (
                <div className={styles.myConfActions}>
                    <button className={`${styles.actionBtn} ${styles.validateBtn}`}>
                        <FiCheckCircle /> Validar asistencia
                    </button>
                    <button
                        className={`${styles.cancelBtn}`}
                        onClick={() => onToggleRegister && onToggleRegister(session.id)}
                        title="Cancelar pre-inscripción"
                    >
                        Cancelar inscripción
                    </button>
                </div>
            ) : (
                <button
                    className={`${styles.actionBtn} ${showAuthHint
                        ? styles.fullBtn // Usamos el rojo de "Sin cupos" para el alerta
                        : agotado
                            ? styles.fullBtn
                            : isRegistered
                                ? styles.registeredBtn
                                : styles.registerBtn
                        }`}
                    onClick={handleRegisterClick}
                    disabled={(agotado && !isRegistered) || showAuthHint}
                >
                    {showAuthHint 
                        ? <><FiLogIn /> Inicia sesión para inscribirte</>
                        : agotado && !isRegistered
                            ? <><FiAlertTriangle /> Sin cupos</>
                            : isRegistered
                                ? <><FiCheckCircle /> Pre-inscrito</>
                                : <><FiCalendar /> Pre-inscribirse</>
                    }
                </button>
            )}
        </article>
    );
}
