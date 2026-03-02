import styles from '../styles/components/Footer.module.css';

/**
 * Footer — pie de página simple con marca y créditos.
 */
export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.inner}>
                <span className={styles.brand}>
                    <span className={styles.accent}>C</span>oniiti
                </span>
                <hr className={styles.divider} />
                <p className={styles.info}>
                    XI Congreso Internacional de Innovación y Tendencias en Ingeniería
                    <br />
                    Bogotá, Colombia · Octubre 1 – 3, 2025
                </p>
                <p className={styles.copy}>
                    © 2025 CONIITI — Universidad Católica de Colombia. Módulo de Agenda Reactiva v1.0
                </p>
            </div>
        </footer>
    );
}
