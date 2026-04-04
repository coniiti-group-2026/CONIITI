import { Link } from 'react-router-dom';
import styles from '../styles/pages/OTPVerification.module.css';

export default function OTPVerification() {
    return (
        <div className={styles.otpContainer}>
            <div className={styles.otpCard}>
                <h2 className={styles.title}>Flujo Legacy Retirado</h2>
                <p className={styles.subtitle}>
                    La verificacion OTP ya no forma parte del flujo activo de autenticacion.
                </p>
                <p className={styles.hint}>
                    Usa el nuevo inicio de sesion centralizado en <strong>auth-service</strong>.
                </p>
                <Link to="/login" className={styles.submitBtn}>
                    Volver a iniciar sesion
                </Link>
            </div>
        </div>
    );
}
