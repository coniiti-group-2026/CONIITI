import {
    FiAward,
    FiCalendar,
    FiCompass,
    FiGlobe,
    FiMapPin,
    FiTarget,
    FiTrendingUp,
    FiUsers,
    FiZap,
} from 'react-icons/fi';

import styles from '../styles/pages/DynamicPage.module.css';

const pillars = [
    {
        icon: <FiTarget />,
        title: 'Mision academica',
        text: 'Impulsar espacios de intercambio para compartir herramientas, experiencias y conocimientos sobre innovacion y tendencias en ingenieria.',
    },
    {
        icon: <FiCompass />,
        title: 'Vision de futuro',
        text: 'Conectar ideas, metodologias y soluciones que aporten a la transformacion creativa desde una mirada tecnica y humanista.',
    },
    {
        icon: <FiZap />,
        title: 'Innovacion aplicada',
        text: 'Promover conversaciones sobre nuevas aproximaciones para disenar soluciones con vision de ingenieria.',
    },
    {
        icon: <FiUsers />,
        title: 'Comunidad academica',
        text: 'Reunir estudiantes, docentes, investigadores, profesionales y aliados del ecosistema innovador.',
    },
    {
        icon: <FiTrendingUp />,
        title: 'Impacto',
        text: 'Fortalecer redes de aprendizaje y colaboracion alrededor de las ingenierias de sistemas, software, telecomunicaciones e informatica.',
    },
];

const highlights = [
    { icon: <FiAward />, value: 'XI', label: 'edicion CONIITI' },
    { icon: <FiMapPin />, value: 'Bogota', label: 'ciudad anfitriona' },
    { icon: <FiCalendar />, value: '1 al 3', label: 'octubre de 2026' },
    { icon: <FiGlobe />, value: 'Internacional', label: 'enfoque academico' },
];

const benefits = [
    'Acceder a perspectivas actuales sobre innovacion, tecnologia e ingenieria.',
    'Conectar con redes academicas y profesionales de Colombia y otros paises.',
    'Compartir experiencias, proyectos y aprendizajes en un entorno colaborativo.',
    'Explorar tendencias que fortalecen la formacion y la practica profesional.',
];

export default function Acerca() {
    return (
        <div className={styles.page}>
            <section className={`${styles.hero} ${styles.heroSplit}`}>
                <div className={styles.heroContent}>
                    <span className={styles.eyebrow}>Congreso internacional</span>
                    <h1>Acerca de CONIITI</h1>
                    <p>
                        Un punto de encuentro academico para explorar innovacion, tendencias y nuevas
                        aproximaciones en ingenieria con vision internacional.
                    </p>
                </div>
                <div className={styles.heroPanel} aria-label="Datos principales del congreso">
                    <span>Innovacion y Tendencias en Ingenieria</span>
                    <strong>XI edicion | 2026</strong>
                    <small>Bogota, Colombia</small>
                </div>
            </section>

            <div className={styles.container}>
                <section className={styles.introBand}>
                    <div>
                        <span className={styles.sectionLabel}>Que es CONIITI</span>
                        <h2>Un espacio para construir conocimiento con alcance global</h2>
                    </div>
                    <p>
                        CONIITI es un espacio abierto de interaccion entre actores del ecosistema
                        innovador, orientado a compartir nuevas aproximaciones para la transformacion
                        creativa de Colombia a traves del diseno de soluciones con vision de ingenieria.
                        Cuenta con participacion activa de ponentes internacionales y redes academicas de
                        America y Europa.
                    </p>
                </section>

                <section className={styles.statsGrid} aria-label="Datos destacados">
                    {highlights.map((item) => (
                        <article className={styles.statCard} key={item.label}>
                            <div className={styles.statIcon}>{item.icon}</div>
                            <strong>{item.value}</strong>
                            <span>{item.label}</span>
                        </article>
                    ))}
                </section>

                <section className={styles.sectionBlock}>
                    <div className={styles.sectionHeading}>
                        <span className={styles.sectionLabel}>Proposito y comunidad</span>
                        <h2>Una agenda pensada para aprender, conectar y proyectar</h2>
                    </div>

                    <div className={styles.aboutGrid}>
                        {pillars.map((pillar) => (
                            <article className={styles.featureCard} key={pillar.title}>
                                <div className={styles.iconWrapper}>{pillar.icon}</div>
                                <h3>{pillar.title}</h3>
                                <p>{pillar.text}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section className={styles.whySection}>
                    <div className={styles.whyContent}>
                        <span className={styles.sectionLabel}>Por que participar</span>
                        <h2>Beneficios para una comunidad que mira hacia adelante</h2>
                        <p>
                            El congreso facilita el dialogo entre academia, industria y sociedad para
                            comprender mejor los retos actuales de la ingenieria y las oportunidades de
                            innovacion.
                        </p>
                    </div>
                    <div className={styles.benefitList}>
                        {benefits.map((benefit) => (
                            <div className={styles.benefitItem} key={benefit}>
                                <FiZap />
                                <span>{benefit}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
