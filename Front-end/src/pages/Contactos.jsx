import {
    FiClock,
    FiHelpCircle,
    FiMail,
    FiMap,
    FiMapPin,
    FiMessageCircle,
    FiPhone,
    FiSend,
} from 'react-icons/fi';

import styles from '../styles/pages/DynamicPage.module.css';

const contactCards = [
    {
        icon: <FiMapPin />,
        title: 'Ubicacion',
        text: 'Bogota, carrera 13 # 47 - 30',
        detail: 'Universidad Catolica de Colombia, Centro de Convenciones, sede 4.',
    },
    {
        icon: <FiMail />,
        title: 'Correo electronico',
        text: 'coniiti@ucatolica.edu.co',
        detail: 'Canal principal para preguntas generales e inscripciones.',
        link: 'mailto:coniiti@ucatolica.edu.co',
    },
    {
        icon: <FiPhone />,
        title: 'Telefonos',
        text: 'PBX: (601) 4433700',
        detail: 'Extensiones: 3130 / 3160 / 3190',
    },
];

const quickQuestions = [
    'Inscripciones y registro al congreso.',
    'Agenda, horarios y actividades academicas.',
    'Soporte para participantes, ponentes y autores.',
];

export default function Contactos() {
    return (
        <div className={styles.page}>
            <section className={`${styles.hero} ${styles.heroSplit}`}>
                <div className={styles.heroContent}>
                    <span className={styles.eyebrow}>Canales oficiales</span>
                    <h1>Contacto</h1>
                    <p>
                        Estamos disponibles para orientar tus consultas sobre inscripciones, agenda,
                        participacion academica y soporte general del congreso.
                    </p>
                </div>
                <a className={styles.heroAction} href="mailto:coniiti@ucatolica.edu.co">
                    <FiSend />
                    Enviar correo
                </a>
            </section>

            <div className={styles.container}>
                <section className={styles.contactLayout}>
                    <div className={styles.contactCards}>
                        {contactCards.map((card) => (
                            <article className={styles.contactCard} key={card.title}>
                                <div className={styles.iconWrapper}>{card.icon}</div>
                                <div>
                                    <h2>{card.title}</h2>
                                    {card.link ? (
                                        <a href={card.link}>{card.text}</a>
                                    ) : (
                                        <p className={styles.contactMain}>{card.text}</p>
                                    )}
                                    <p>{card.detail}</p>
                                </div>
                            </article>
                        ))}
                    </div>

                    <aside className={styles.mapPanel} aria-label="Referencia de ubicacion">
                        <div className={styles.mapVisual}>
                            <FiMap />
                            <span>Universidad Catolica de Colombia</span>
                            <strong>Centro de Convenciones, sede 4</strong>
                        </div>
                        <div className={styles.mapFooter}>
                            <FiMapPin />
                            <span>Bogota, carrera 13 # 47 - 30</span>
                        </div>
                    </aside>
                </section>

                <section className={styles.infoGrid}>
                    <article className={styles.infoPanel}>
                        <div className={styles.panelTitle}>
                            <FiClock />
                            <h2>Horarios y canal de consulta</h2>
                        </div>
                        <p>
                            Puedes escribir al correo institucional para recibir orientacion sobre el
                            proceso de participacion. Las respuestas se atienden por los canales oficiales
                            de la universidad y del congreso.
                        </p>
                        <a className={styles.primaryButton} href="mailto:coniiti@ucatolica.edu.co">
                            <FiMail />
                            Enviar correo
                        </a>
                    </article>

                    <article className={styles.infoPanel}>
                        <div className={styles.panelTitle}>
                            <FiHelpCircle />
                            <h2>Preguntas rapidas</h2>
                        </div>
                        <div className={styles.quickList}>
                            {quickQuestions.map((question) => (
                                <div className={styles.quickItem} key={question}>
                                    <FiMessageCircle />
                                    <span>{question}</span>
                                </div>
                            ))}
                        </div>
                    </article>
                </section>
            </div>
        </div>
    );
}
