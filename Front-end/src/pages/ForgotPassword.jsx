import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../services/authService';
import styles from '../styles/pages/ForgotPassword.module.css';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setMessage('');
        setIsLoading(true);

        try {
            const response = await forgotPassword({ email });
            setMessage(response.message);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.card}>
                <h2 className={styles.title}>Recuperar contrasena</h2>
                <p className={styles.subtitle}>
                    Ingresa tu correo y te enviaremos un enlace seguro para restablecer tu contrasena.
                </p>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="forgot-email">Correo electronico</label>
                        <input
                            id="forgot-email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="tu@correo.com"
                            required
                            autoComplete="email"
                        />
                    </div>

                    {message && <p className={styles.successMessage}>{message}</p>}
                    {error && <p className={styles.errorMessage}>{error}</p>}

                    <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                        {isLoading ? 'Enviando...' : 'Enviar enlace'}
                    </button>
                </form>

                <p className={styles.resendHint}>
                    Si el correo existe, recibiras instrucciones sin exponer el estado de la cuenta.
                </p>

                <div className={styles.footerLink}>
                    <Link to="/login" className={styles.linkBtn}>Volver al inicio de sesion</Link>
                </div>
            </div>
        </div>
    );
}
