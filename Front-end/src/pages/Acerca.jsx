import React from 'react';
import styles from '../styles/pages/DynamicPage.module.css';
import { FiInfo, FiTarget, FiGlobe } from 'react-icons/fi';

export default function Acerca() {
    return (
        <div className={styles.page}>
            <div className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1>Acerca de CONIITI</h1>
                    <p>Conoce más sobre el Congreso Internacional de Innovación y Tendencias en Ingeniería.</p>
                </div>
            </div>

            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.iconWrapper}><FiInfo /></div>
                    <h2>¿Qué es CONIITI?</h2>
                    <p>Es un espacio abierto de interacción entre actores del ecosistema innovador, orientado a compartir nuevas aproximaciones para la transformación creativa de Colombia a través del diseño de soluciones con visión de ingeniería.</p>
                </div>

                <div className={styles.card}>
                    <div className={styles.iconWrapper}><FiTarget /></div>
                    <h2>Nuestro Propósito</h2>
                    <p>Impulsar el desarrollo de la innovación brindando herramientas y conocimientos sobre las nuevas tendencias en el área, bajo el lema "Innovación y Tendencias en Ingeniería".</p>
                </div>

                <div className={styles.card}>
                    <div className={styles.iconWrapper}><FiGlobe /></div>
                    <h2>Alcance Internacional</h2>
                    <p>Contamos con la participación activa de ponentes de talla internacional y redes académicas provenientes de gran parte de América y Europa, convirtiéndose en el epicentro de la visión global sobre el avance en ingenierías de sistemas, software, telecomunicaciones e informática.</p>
                </div>
            </div>
        </div>
    );
}
