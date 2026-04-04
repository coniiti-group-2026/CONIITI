import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    FiArrowRight,
    FiAward,
    FiBookOpen,
    FiBriefcase,
    FiCheck,
    FiChevronLeft,
    FiChevronRight,
    FiLink,
    FiMonitor,
    FiUsers,
} from 'react-icons/fi';

import SpeakerCard from '../components/SpeakerCard';
import { useAuth } from '../context/AuthContext';
import { getApiBase } from '../services/apiConfig';
import { createCheckout, PAYMENT_PLANS } from '../services/paymentService';
import styles from '../styles/pages/Home.module.css';


const API_BASE = getApiBase();
const SPEAKERS_PER_PAGE = 5;


const FALLBACK_SPEAKERS = [
    {
        ponente: 'Dr. Alessandro Conti',
        afiliacion: 'Experto en Inteligencia Artificial, Milan',
        foto_ponente_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=350',
    },
    {
        ponente: 'Dra. Sofia Restrepo',
        afiliacion: 'CEO Innovatech Latam',
        foto_ponente_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=350',
    },
    {
        ponente: 'Ing. Marco Rossi',
        afiliacion: 'Lider Infraestructuras Cloud',
        foto_ponente_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=350',
    },
];


function Countdown() {
    const calculateTimeLeft = () => {
        const targetDate = new Date('October 1, 2026 00:00:00').getTime();
        const now = Date.now();
        const difference = targetDate - now;

        if (difference <= 0) return {};

        return {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
        };
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => setTimeLeft(calculateTimeLeft()), 1000);
        return () => clearTimeout(timer);
    });

    if (!timeLeft.days && timeLeft.days !== 0) {
        return <div className={styles.countdownContainer}><h2>El Congreso ha comenzado.</h2></div>;
    }

    return (
        <div className={styles.countdownContainer}>
            {[
                ['Dias', timeLeft.days],
                ['Horas', timeLeft.hours],
                ['Min', timeLeft.minutes],
                ['Seg', timeLeft.seconds],
            ].map(([label, value]) => (
                <div key={label} className={styles.countdownBox}>
                    <span className={styles.countdownValue}>{value}</span>
                    <span className={styles.countdownLabel}>{label}</span>
                </div>
            ))}
        </div>
    );
}


function SpeakerSlider({ speakers }) {
    const [idx, setIdx] = useState(0);
    const timerRef = useRef(null);
    const totalPages = Math.ceil(speakers.length / SPEAKERS_PER_PAGE);

    const next = () => setIdx((current) => (current + 1) % totalPages);
    const prev = () => setIdx((current) => (current - 1 + totalPages) % totalPages);

    useEffect(() => {
        if (totalPages <= 1) return undefined;
        timerRef.current = setInterval(next, 4500);
        return () => clearInterval(timerRef.current);
    });

    if (!speakers.length) return null;

    const visible = speakers.slice(idx * SPEAKERS_PER_PAGE, idx * SPEAKERS_PER_PAGE + SPEAKERS_PER_PAGE);

    return (
        <div style={{ position: 'relative' }}>
            <div className={styles.speakersGrid}>
                {visible.map((speaker, index) => (
                    <SpeakerCard key={speaker.ponente + index} speaker={speaker} />
                ))}
            </div>
            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                    <button onClick={prev} style={navBtnStyle}><FiChevronLeft size={20} /></button>
                    <span style={{ color: '#64748b', fontSize: '0.85rem' }}>{idx + 1} / {totalPages}</span>
                    <button onClick={next} style={navBtnStyle}><FiChevronRight size={20} /></button>
                </div>
            )}
        </div>
    );
}


const navBtnStyle = {
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
};


function getUserHubPath(user) {
    if (!user) return '/register';
    if (user.role === 'superuser') return '/superusuario';
    if (user.role === 'staff') return '/staff';
    return '/mis-conferencias';
}


function getUserHubLabel(user) {
    if (!user) return 'Crear Cuenta';
    if (user.role === 'superuser') return 'Ir al Panel Admin';
    if (user.role === 'staff') return 'Ir al Panel Staff';
    return 'Ir a Mis Conferencias';
}


function getAccessHighlights(user) {
    if (!user) {
        return [
            'Crear cuenta segura con auth-service',
            'Gestionar agenda desde agenda-service',
            'Notificaciones desacopladas por eventos',
        ];
    }

    if (user.role === 'superuser') {
        return [
            'Sesion autenticada y cookies activas en auth-service',
            'Acceso al panel administrativo y gestion de sesiones',
            'Integracion con agenda y notificaciones desacopladas',
        ];
    }

    if (user.role === 'staff') {
        return [
            'Sesion autenticada y perfil staff cargado',
            'Acceso directo al panel operativo de agenda',
            'Flujo desacoplado con notificaciones por eventos',
        ];
    }

    return [
        'Sesion autenticada y cuenta activa en la plataforma',
        'Acceso a agenda y preinscripciones personales',
        'Flujo principal disponible sin depender del monolito',
    ];
}


export default function Home() {
    const { user, isLoading } = useAuth();
    const [keynotes, setKeynotes] = useState([]);
    const [checkoutLoadingKey, setCheckoutLoadingKey] = useState('');
    const [checkoutError, setCheckoutError] = useState('');

    useEffect(() => {
        fetch(`${API_BASE}/agenda/speakers?principal_only=true`)
            .then((response) => (response.ok ? response.json() : []))
            .then((data) => setKeynotes(data))
            .catch(() => setKeynotes([]));
    }, []);

    const handleCheckout = async (plan, region) => {
        if (!user) return;

        const loadingKey = `${plan.id}-${region}`;
        setCheckoutLoadingKey(loadingKey);
        setCheckoutError('');

        try {
            const isLocal = region === 'LOCAL';
            const payment = await createCheckout({
                userId: user.id,
                amount: isLocal ? plan.localAmount : plan.internationalAmount,
                currency: isLocal ? plan.localCurrency : plan.internationalCurrency,
                paymentRegion: region,
            });

            if (!payment?.checkout_url) {
                throw new Error('La pasarela no devolvio una URL de checkout.');
            }

            window.location.assign(payment.checkout_url);
        } catch (error) {
            setCheckoutError(error.message);
        } finally {
            setCheckoutLoadingKey('');
        }
    };

    return (
        <div className={styles.home}>
            <header className={styles.hero}>
                <div className={styles.heroBackground}>
                    <img src="/colosseum_italy_hero.png" alt="Colosseum Background Italy" fetchPriority="high" width="1920" height="1080" />
                </div>
                <div className={styles.heroOverlay}></div>

                <div className={styles.heroContent}>
                    <span className={styles.badge}>Edicion Italia 2026</span>
                    <h1>XI CONIITI 2026</h1>
                    <p>
                        {user
                            ? `Bienvenido${user.full_name ? `, ${user.full_name}` : ''}. Tu sesion ya esta activa para participar en CONIITI 2026.`
                            : 'Congreso Internacional de Innovacion y Tendencias en Ingenieria del 1 al 3 de octubre de 2026.'}
                    </p>

                    <Countdown />

                    <div className={styles.heroButtons}>
                        <Link to="/agenda" className={styles.primaryBtn}>
                            Ver Agenda Abierta <FiArrowRight />
                        </Link>
                        {!isLoading && (
                            <Link to={getUserHubPath(user)} className={styles.secondaryBtn}>
                                {getUserHubLabel(user)}
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            <section className={`${styles.sectionBlock} ${styles.whySection}`}>
                <div className={styles.whyHeader}>
                    <span className={styles.preTitle}>Por que asistir al</span>
                    <h2 className={styles.mainTitleBlue}>XI Congreso Internacional de Innovacion y Tendencias en Ingenieria</h2>
                </div>

                <div className={styles.whyGridCenter}>
                    <div className={styles.whyColLeft}>
                        <div className={styles.whyFeatureCard}>
                            <div className={styles.featureIcon}><FiUsers /></div>
                            <h3>Networking de alto nivel</h3>
                            <p>Conecta con lideres de industria, investigadores y equipos con los que podras construir alianzas reales.</p>
                        </div>
                        <div className={styles.whyFeatureCard}>
                            <div className={styles.featureIcon}><FiLink /></div>
                            <h3>Alianzas estrategicas</h3>
                            <p>Las sesiones del congreso estan pensadas para crear proyectos conjuntos de impacto academico y profesional.</p>
                        </div>
                    </div>

                    <div className={styles.whyColCenter}>
                        <div className={styles.centerGraphicPulse}>
                            <div className={styles.coreOrb}></div>
                            <div className={`${styles.orbit} ${styles.orb1}`}></div>
                            <div className={`${styles.orbit} ${styles.orb2}`}></div>
                            <div className={`${styles.orbit} ${styles.orb3}`}></div>
                        </div>
                    </div>

                    <div className={styles.whyColRight}>
                        <div className={styles.whyFeatureCard}>
                            <div className={styles.featureIcon}><FiBriefcase /></div>
                            <h3>Conferencias y talleres</h3>
                            <p>Accede a plenarias y workshops centrados en software, datos, IA, ciberseguridad y transformacion digital.</p>
                        </div>
                        <div className={styles.whyFeatureCard}>
                            <div className={styles.featureIcon}><FiMonitor /></div>
                            <h3>Desarrollo profesional</h3>
                            <p>Fortalece tu perfil tecnico con contenido vigente y experiencias de aplicacion real.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className={`${styles.sectionBlock} ${styles.darkBg} ${styles.fullWidthBlock}`}>
                <div className={styles.darkBgInner}>
                    <h2 className={styles.sectionTitle}>Impacto CONIITI</h2>
                    <p className={styles.sectionSubtitle}>Una plataforma que integra academia, industria y comunidad tecnologica.</p>

                    <div className={styles.impactGrid}>
                        <div className={styles.impactCard}>
                            <div className={styles.impactIcon}><FiUsers /></div>
                            <div className={styles.impactNumber}>95+</div>
                            <div className={styles.impactLabel}>Conferencistas Principales</div>
                        </div>
                        <div className={styles.impactCard}>
                            <div className={styles.impactIcon}><FiAward /></div>
                            <div className={styles.impactNumber}>12</div>
                            <div className={styles.impactLabel}>Paises Invitados</div>
                        </div>
                        <div className={styles.impactCard}>
                            <div className={styles.impactIcon}><FiBookOpen /></div>
                            <div className={styles.impactNumber}>30+</div>
                            <div className={styles.impactLabel}>Workshops y ponencias</div>
                        </div>
                        <div className={styles.impactCard}>
                            <div className={styles.impactIcon}><FiUsers /></div>
                            <div className={styles.impactNumber}>999+</div>
                            <div className={styles.impactLabel}>Participantes esperados</div>
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.sectionBlock}>
                <h2 className={styles.sectionTitle}>Conferencistas Principales</h2>
                <p className={styles.sectionSubtitle}>Conoce a algunos de los expertos que guiaran las plenarias de innovacion.</p>

                {keynotes.length > 0 ? (
                    <SpeakerSlider speakers={keynotes} />
                ) : (
                    <div className={styles.speakersGrid}>
                        {FALLBACK_SPEAKERS.map((speaker, index) => (
                            <SpeakerCard key={speaker.ponente + index} speaker={speaker} />
                        ))}
                    </div>
                )}

                <div className={styles.centerBtn}>
                    <Link to="/conferencistas" className={styles.primaryBtn}>Conoce a todos los conferencistas</Link>
                </div>
            </section>

            <section id="inscripciones" className={`${styles.sectionBlock} ${styles.blueBg}`}>
                {user ? (
                    <div className={styles.accessContainer}>
                        <h2 className={styles.sectionTitle}>Opciones de pago</h2>
                        <p className={styles.sectionSubtitle}>
                            Tu sesion esta activa. Completa tu proceso usando las dos pasarelas disponibles en payments-service.
                        </p>

                        {!!checkoutError && (
                            <p className={styles.paymentError}>{checkoutError}</p>
                        )}

                        <div className={styles.pricingGrid}>
                            {PAYMENT_PLANS.map((plan) => (
                                <article
                                    key={plan.id}
                                    className={`${styles.pricingCard} ${plan.optional ? styles.optionalCard : ''}`}
                                >
                                    {plan.optional && <span className={styles.optionalBadge}>Opcional</span>}
                                    <h3 className={styles.pricingTitle}>{plan.title}</h3>
                                    <div className={styles.pricingAmount}>
                                        {plan.amountLabel}
                                        <span> COP</span>
                                    </div>
                                    <div className={styles.paymentProviders}>
                                        <span>Mercado Pago</span>
                                        <span>PayPal</span>
                                    </div>
                                    <ul className={styles.pricingFeatures}>
                                        {plan.features.map((feature) => (
                                            <li key={feature}><FiCheck size={20} color="#ffc107" /> {feature}</li>
                                        ))}
                                    </ul>
                                    <div className={styles.paymentActions}>
                                        <button
                                            type="button"
                                            className={styles.pricingBtn}
                                            onClick={() => handleCheckout(plan, 'LOCAL')}
                                            disabled={checkoutLoadingKey !== ''}
                                        >
                                            {checkoutLoadingKey === `${plan.id}-LOCAL` ? 'Conectando...' : 'Pagar en Colombia'}
                                        </button>
                                        <button
                                            type="button"
                                            className={`${styles.pricingBtn} ${styles.paymentAltBtn}`}
                                            onClick={() => handleCheckout(plan, 'INTERNATIONAL')}
                                            disabled={checkoutLoadingKey !== ''}
                                        >
                                            {checkoutLoadingKey === `${plan.id}-INTERNATIONAL` ? 'Conectando...' : 'Pagar internacional'}
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className={styles.pricingContainer}>
                        <h2 className={styles.sectionTitle}>Inscripciones</h2>
                        <p className={styles.sectionSubtitle}>
                            El flujo principal de la plataforma ya esta desacoplado en microservicios y listo para registro, autenticacion y agenda.
                        </p>

                        <div className={styles.pricingGrid}>
                            <div className={styles.pricingCard}>
                                <h3 className={styles.pricingTitle}>Ponentes y asistentes</h3>
                                <div className={styles.pricingAmount}>Registro digital</div>
                                <ul className={styles.pricingFeatures}>
                                    {getAccessHighlights(null).map((item) => (
                                        <li key={item}><FiCheck size={20} color="#ffc107" /> {item}</li>
                                    ))}
                                </ul>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <Link className={styles.pricingBtn} to="/register">Crear cuenta e inscribirme</Link>
                                    <Link className={styles.pricingBtn} style={{ background: '#0070ba' }} to="/login">Ya tengo cuenta</Link>
                                </div>
                            </div>

                            <div className={styles.pricingCard}>
                                <h3 className={styles.pricingTitle}>Soporte de inscripcion</h3>
                                <div className={styles.pricingAmount}>Canal oficial</div>
                                <ul className={styles.pricingFeatures}>
                                    <li><FiCheck size={20} color="#ffc107" /> Atencion para participantes internacionales</li>
                                    <li><FiCheck size={20} color="#ffc107" /> Gestion de certificados y consultas</li>
                                    <li><FiCheck size={20} color="#ffc107" /> Acompanamiento del equipo CONIITI</li>
                                </ul>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <a className={styles.pricingBtn} href="mailto:coniiti@ucatolica.edu.co">Escribir a soporte</a>
                                    <Link className={styles.pricingBtn} style={{ background: '#0070ba' }} to="/agenda">Explorar agenda</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}
