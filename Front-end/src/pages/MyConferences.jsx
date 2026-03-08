import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import AgendaGrid from '../components/AgendaGrid';
import SpeakerModal from '../components/SpeakerModal';
import { useAgenda } from '../hooks/useAgenda';
import { FiBookmark, FiLogIn } from 'react-icons/fi';
import styles from '../styles/pages/MyConferences.module.css';

/**
 * MyConferences — muestra las sesiones en las que el usuario se pre-inscribió.
 * El botón "Validar asistencia" reemplaza a "Pre-inscribirse".
 */
export default function MyConferences({ registeredIds = new Set(), onToggleRegister }) {
    const { user } = useContext(AuthContext);
    const [selectedSpeaker, setSelectedSpeaker] = useState(null);
    const { sessions } = useAgenda();

    // Estado cuando no hay usuario autenticado
    if (!user) {
        return (
            <div className={styles.page}>
                <div className={styles.empty}>
                    <FiLogIn size={48} className={styles.emptyIcon} style={{color: '#dc2626'}} />
                    <h2 style={{color: 'var(--color-primary)', marginTop: '1rem'}}>Inicia sesión</h2>
                    <p style={{margin: '1rem 0 1.5rem 0', color: 'var(--text-muted)'}}>
                        Debes estar registrado e iniciar sesión para ver y gestionar tus pre-inscripciones.
                    </p>
                    <Link 
                        to="/login" 
                        style={{
                            background: 'var(--color-primary)', 
                            color: 'white', 
                            padding: '0.8rem 1.5rem', 
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontWeight: '600',
                            transition: 'background 0.3s'
                        }}
                    >
                        Ir al inicio de sesión
                    </Link>
                </div>
            </div>
        );
    }

    // Filtra todas las sesiones para mostrar solo las pre-inscritas (desde useAgenda)
    const mySessions = sessions.filter((s) => registeredIds.has(s.id));

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <FiBookmark className={styles.headerIcon} />
                <div>
                    <h1 className={styles.title}>Mis Conferencias</h1>
                    <p className={styles.subtitle}>
                        {mySessions.length === 0
                            ? 'Aún no te has pre-inscrito a ninguna sesión.'
                            : `${mySessions.length} sesión${mySessions.length !== 1 ? 'es' : ''} pre-inscrita${mySessions.length !== 1 ? 's' : ''}`
                        }
                    </p>
                </div>
            </div>

            {mySessions.length === 0 ? (
                <div className={styles.empty}>
                    <FiBookmark size={48} className={styles.emptyIcon} />
                    <p>Ve a la <strong>Agenda</strong> y haz clic en <em>"Pre-inscribirse"</em> en las sesiones que te interesen.</p>
                </div>
            ) : (
                <AgendaGrid
                    sessions={mySessions}
                    isLoading={false}
                    onSpeakerClick={setSelectedSpeaker}
                    registeredIds={registeredIds}
                    onToggleRegister={onToggleRegister}
                    mode="mis-conferencias"
                />
            )}

            {selectedSpeaker && (
                <SpeakerModal
                    speaker={selectedSpeaker}
                    onClose={() => setSelectedSpeaker(null)}
                />
            )}
        </div>
    );
}
