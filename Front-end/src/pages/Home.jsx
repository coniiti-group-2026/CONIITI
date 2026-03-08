import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiUsers, FiAward, FiBookOpen, FiGlobe, FiCheck, FiLink, FiBriefcase, FiMonitor } from 'react-icons/fi';
import styles from '../styles/pages/Home.module.css';

const Countdown = () => {
    const calculateTimeLeft = () => {
        // Fecha objetivo: 1 de octubre 2026
        const targetDate = new Date("October 1, 2026 00:00:00").getTime();
        const now = new Date().getTime();
        const difference = targetDate - now;

        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60)
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearTimeout(timer);
    });

    if (!timeLeft.days && timeLeft.days !== 0) {
        return <div className={styles.countdownContainer}><h2>¡El Congreso ha comenzado!</h2></div>;
    }

    return (
        <div className={styles.countdownContainer}>
            <div className={styles.countdownBox}>
                <span className={styles.countdownValue}>{timeLeft.days}</span>
                <span className={styles.countdownLabel}>Días</span>
            </div>
            <div className={styles.countdownBox}>
                <span className={styles.countdownValue}>{timeLeft.hours}</span>
                <span className={styles.countdownLabel}>Horas</span>
            </div>
            <div className={styles.countdownBox}>
                <span className={styles.countdownValue}>{timeLeft.minutes}</span>
                <span className={styles.countdownLabel}>Min</span>
            </div>
            <div className={styles.countdownBox}>
                <span className={styles.countdownValue}>{timeLeft.seconds}</span>
                <span className={styles.countdownLabel}>Seg</span>
            </div>
        </div>
    );
};

export default function Home() {
    return (
        <div className={styles.home}>
            {/* ── HERO SECTION & VIDEO ── */}
            <header className={styles.hero}>
                <div className={styles.heroBackground}>
                    {/* Placeholder Colosseum Italy Video/Background */}
                    <img src="/colosseum_italy_hero.png" alt="Colosseum Background Italy" />
                </div>
                <div className={styles.heroOverlay}></div>
                
                <div className={styles.heroContent}>
                    <span className={styles.badge}>Edición Italia 2026</span>
                    <h1>XI CONIITI 2026</h1>
                    <p>Décimo Primer Congreso Internacional de Innovación y Tendencias en Ingeniería. Únete a la comunidad de investigadores y profesionales liderando el avance tecnológico en el mundo del 1 al 3 de octubre de 2026.</p>
                    
                    <Countdown />

                    <div className={styles.heroButtons}>
                        <Link to="/agenda" className={styles.primaryBtn}>
                            Ver Agenda Abierta <FiArrowRight />
                        </Link>
                        {/* El link al ancla de precios en la misma página */}
                        <a href="#inscripciones" className={styles.secondaryBtn}>
                            Inscribirse Ahora
                        </a>
                    </div>
                </div>
            </header>

            {/* ── SECCIÓN: POR QUÉ ASISTIR (REDISEÑO PREMIUM) ── */}
            <section className={`${styles.sectionBlock} ${styles.whySection}`}>
                <div className={styles.whyHeader}>
                    <span className={styles.preTitle}>Por qué asistir al</span>
                    <h2 className={styles.mainTitleBlue}>XI Congreso Internacional de Innovación y Tendencias en Ingeniería</h2>
                </div>

                <div className={styles.whyGridCenter}>
                    {/* Columna Izquierda */}
                    <div className={styles.whyColLeft}>
                        <div className={styles.whyFeatureCard}>
                            <div className={styles.featureIcon}><FiUsers /></div>
                            <h3>Networking de alto nivel</h3>
                            <p>Participar en CONIITI te permitirá conectar con líderes de la industria, potenciales empleadores y profesionales afines. Este networking abrirá puertas a invaluables proyecciones y proyectos colaborativos.</p>
                        </div>
                        <div className={styles.whyFeatureCard}>
                            <div className={styles.featureIcon}><FiLink /></div>
                            <h3>Alianzas Estratégicas</h3>
                            <p>Las sesiones y talleres están diseñados para fomentar la cooperación. Podrás conocer a posibles socios con los que podrás desarrollar iniciativas conjuntas altamente rentables e innovadoras.</p>
                        </div>
                    </div>

                    {/* Columna Central (Ilustración Dinámica Orbital) */}
                    <div className={styles.whyColCenter}>
                        <div className={styles.centerGraphicPulse}>
                            <div className={styles.coreOrb}></div>
                            <div className={`${styles.orbit} ${styles.orb1}`}></div>
                            <div className={`${styles.orbit} ${styles.orb2}`}></div>
                            <div className={`${styles.orbit} ${styles.orb3}`}></div>
                        </div>
                    </div>

                    {/* Columna Derecha */}
                    <div className={styles.whyColRight}>
                        <div className={styles.whyFeatureCard}>
                            <div className={styles.featureIcon}><FiBriefcase /></div>
                            <h3>Conferencias y talleres</h3>
                            <p>Tendrás acceso a una serie de plenarias y talleres impartidos por expertos de renombre, donde podrás adquirir conocimientos valiosos sobre la vanguardia tecnológica mundial.</p>
                        </div>
                        <div className={styles.whyFeatureCard}>
                            <div className={styles.featureIcon}><FiMonitor /></div>
                            <h3>Desarrollo Profesional</h3>
                            <p>Participar en este magno evento te ayudará a desarrollar nuevas habilidades y competencias técnicas, mejorando exponencialmente tu currículum académico e investigativo.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── IMPACTO CONIITI (DARK CORPORATE) ── */}
            <section className={`${styles.sectionBlock} ${styles.darkBg} ${styles.fullWidthBlock}`}>
                <div className={styles.darkBgInner}>
                    <h2 className={styles.sectionTitle}>Impacto CONIITI</h2>
                    <p className={styles.sectionSubtitle}>La evolución del congreso en números, reuniendo mentes brillantes de más de 12 países en un entorno híbrido sin precedentes.</p>
                
                <div className={styles.impactGrid}>
                    <div className={styles.impactCard}>
                        <div className={styles.impactIcon}><FiUsers /></div>
                        <div className={styles.impactNumber}>95+</div>
                        <div className={styles.impactLabel}>Conferencistas Principales</div>
                    </div>
                    <div className={styles.impactCard}>
                        <div className={styles.impactIcon}><FiAward /></div>
                        <div className={styles.impactNumber}>1</div>
                        <div className={styles.impactLabel}>Patrocinadores</div>
                    </div>
                    <div className={styles.impactCard}>
                        <div className={styles.impactIcon}><FiBookOpen /></div>
                        <div className={styles.impactNumber}>30+</div>
                        <div className={styles.impactLabel}>Ofertas de Workshops</div>
                    </div>
                    <div className={styles.impactCard}>
                        <div className={styles.impactIcon}><FiUsers /></div>
                        <div className={styles.impactNumber}>999+</div>
                        <div className={styles.impactLabel}>Participantes del Evento</div>
                    </div>
                </div>
                </div>
            </section>

            {/* ── CONFERENCISTAS DESTACADOS ── */}
            <section className={styles.sectionBlock}>
                <h2 className={styles.sectionTitle}>Conferencistas Principales</h2>
                <p className={styles.sectionSubtitle}>Conoce a algunos de los expertos que guiarán las plenarias de innovación.</p>

                <div className={styles.speakersGrid}>
                    <div className={styles.speakerCard}>
                        <div className={styles.speakerImg}>
                            <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=350" alt="Dr. Alessandro Conti" />
                        </div>
                        <h4 className={styles.speakerName}>Dr. Alessandro Conti</h4>
                        <p className={styles.speakerRole}>Experto en Inteligencia Artificial, Milán</p>
                    </div>
                    <div className={styles.speakerCard}>
                        <div className={styles.speakerImg}>
                            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=350" alt="Dra. Sofía Restrepo" />
                        </div>
                        <h4 className={styles.speakerName}>Dra. Sofía Restrepo</h4>
                        <p className={styles.speakerRole}>CEO Innovatech Latam</p>
                    </div>
                    <div className={styles.speakerCard}>
                        <div className={styles.speakerImg}>
                            <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=350" alt="Ing. Marco Rossi" />
                        </div>
                        <h4 className={styles.speakerName}>Ing. Marco Rossi</h4>
                        <p className={styles.speakerRole}>Líder Infraestructuras Cloud</p>
                    </div>
                </div>
                
                <div className={styles.centerBtn}>
                    <Link to="/conferencistas" className={styles.primaryBtn}>Conoce a todos los conferencistas</Link>
                </div>
            </section>

            {/* ── PASARELA DE PAGOS / INSCRIPCIONES ── */}
            <section id="inscripciones" className={`${styles.sectionBlock} ${styles.blueBg}`}>
                <div className={styles.pricingContainer}>
                    <h2 className={styles.sectionTitle}>Pasarela de Pagos e Inscripciones</h2>
                    <p className={styles.sectionSubtitle}>Asegura tu participación en el Congreso seleccionando tu categoría de inscripción.</p>

                    <div className={styles.pricingGrid}>
                        {/* Tarjeta Miembros UCatólica e IEEE */}
                        <div className={styles.pricingCard}>
                            <h3 className={styles.pricingTitle}>Miembros U. Católica E IEEE</h3>
                            <div className={styles.pricingAmount}>$ 940.000<span style={{ fontSize: '1rem' }}>/COP</span></div>
                            <ul className={styles.pricingFeatures}>
                                <li><FiCheck size={20} color="#ffc107" /> Inscripción como Ponente</li>
                                <li><FiCheck size={20} color="#ffc107" /> Constancia de participación para todos los autores</li>
                                <li><FiCheck size={20} color="#ffc107" /> Publicación de las memorias</li>
                            </ul>
                            <button className={styles.pricingBtn} onClick={() => alert('Dirigiendo a Módulo de Pago')}>Pagar</button>
                        </div>

                        {/* Tarjeta No Miembros */}
                        <div className={styles.pricingCard}>
                            <h3 className={styles.pricingTitle}>Sí no eres miembro UCatólica ó IEEE</h3>
                            <div className={styles.pricingAmount}>$ 980.000<span style={{ fontSize: '1rem' }}>/COP</span></div>
                            <ul className={styles.pricingFeatures}>
                                <li><FiCheck size={20} color="#ffc107" /> Inscripción como Ponente</li>
                                <li><FiCheck size={20} color="#ffc107" /> Constancia de participación para todos los autores</li>
                                <li><FiCheck size={20} color="#ffc107" /> Publicación de las memorias</li>
                            </ul>
                            <button className={styles.pricingBtn} onClick={() => alert('Dirigiendo a Módulo de Pago')}>Pagar</button>
                        </div>

                        {/* Tarjeta Opcional Conferencias */}
                        <div className={`${styles.pricingCard} ${styles.optionalCard}`}>
                            <div className={styles.optionalBadge}>OPCIONAL</div>
                            <h3 className={styles.pricingTitle}>Si desea constancia por participación en conferencias</h3>
                            <div className={styles.pricingAmount}>$ 120.000<span style={{ fontSize: '1rem' }}>/COP</span></div>
                            <ul className={styles.pricingFeatures}>
                                <li><FiCheck size={20} color="#ffc107" /> Certificado de Asistencia</li>
                            </ul>
                            <button className={styles.pricingBtn} onClick={() => alert('Dirigiendo a Módulo de Pago')}>Añadir al carrito</button>
                        </div>

                        {/* Tarjeta Opcional Workshops */}
                        <div className={`${styles.pricingCard} ${styles.optionalCard}`}>
                            <div className={styles.optionalBadge}>OPCIONAL</div>
                            <h3 className={styles.pricingTitle}>Si desea constancia por participación en Workshops</h3>
                            <div className={styles.pricingAmount}>$ 90.000<span style={{ fontSize: '1rem' }}>/COP</span></div>
                            <ul className={styles.pricingFeatures}>
                                <li><FiCheck size={20} color="#ffc107" /> Certificado de Asistencia</li>
                            </ul>
                            <button className={styles.pricingBtn} onClick={() => alert('Dirigiendo a Módulo de Pago')}>Añadir al carrito</button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}