import React from 'react';
import styles from '../styles/pages/DynamicPage.module.css';
import { FiMail, FiMapPin, FiPhone } from 'react-icons/fi';

export default function Contactos() {
    return (
        <div className={styles.page}>
            <div className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1>Contacto</h1>
                    <p>¿Tienes alguna duda o consulta? Estamos a tu disposición.</p>
                </div>
            </div>

            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.iconWrapper}><FiMapPin /></div>
                    <h2>Ubicación</h2>
                    <p>Bogotá, Carrera 13 # 47 – 30</p>
                    <p>Universidad Católica de Colombia, Centro de Convenciones, Sede 4.</p>
                </div>

                <div className={styles.card}>
                    <div className={styles.iconWrapper}><FiMail /></div>
                    <h2>Correo Electrónico</h2>
                    <p>Para preguntas generales e inscripciones:</p>
                    <a href="mailto:coniiti@ucatolica.edu.co">coniiti@ucatolica.edu.co</a>
                </div>

                <div className={styles.card}>
                    <div className={styles.iconWrapper}><FiPhone /></div>
                    <h2>Teléfonos</h2>
                    <p>PBX: (601) 4433700</p>
                    <p>Extensiones: 3130 / 3160 / 3190</p>
                </div>
            </div>
        </div>
    );
}
