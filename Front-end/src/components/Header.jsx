import {
    FiCalendar,
    FiMapPin,
    FiGlobe,
    FiRefreshCw,
} from 'react-icons/fi';
import styles from '../styles/components/Header.module.css';

/**
 * Header — barra de marca CONIITI + sección hero.
 */
export default function Header() {
    return (
        <header>
            {/* Barra superior */}
            <div className={styles.header}>
                <div className={styles.topBar}>
                    <span className={styles.topBarItem}>
                        <FiMapPin size={12} />
                        Bogotá, Universidad Católica de Colombia
                    </span>
                    <span className={styles.topBarItem}>
                        <FiCalendar size={12} />
                        Octubre 1 – 3, 2026
                    </span>
                    <span className={styles.topBarItem}>
                        <FiGlobe size={12} />
                        Híbrido
                    </span>
                </div>

                <div className={styles.mainBar}>
                    <div className={styles.brand}>
                        <span className={styles.brandName}>
                            <span className={styles.brandAccent}>C</span>oniiti
                        </span>
                        <span className={styles.brandTagline}>
                            XI Congreso Internacional
                        </span>
                    </div>
                </div>
            </div>

            {/* Héroe */}
            <div className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>
                        Agenda{' '}
                        <span className={styles.heroHighlight}>CONIITI 2026 v1</span>
                    </h1>
                    <p className={styles.heroSubtitle}>
                        Décimo Primer Congreso Internacional de Innovación y Tendencias en
                        Ingeniería — Consulta horarios, salones y enlaces de sesiones
                        actualizados en tiempo real.
                    </p>
                    <div className={styles.heroBadges}>
                        <span className={styles.heroBadge}>
                            <span className={styles.liveDot} />
                            Actualización en vivo
                        </span>
                        <span className={styles.heroBadge}>
                            <FiRefreshCw size={14} />
                            Auto-refresh 60s
                        </span>
                        <span className={styles.heroBadge}>
                            <FiCalendar size={14} />
                            3 días · 12 sesiones
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
}
