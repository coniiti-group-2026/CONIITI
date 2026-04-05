import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../services/authService';
import styles from '../styles/pages/ForgotPassword.module.css';

export default function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') ?? '';
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const tokenMissing = !token;

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        setIsLoading(true);
        try {
            await resetPassword({
                token,
                new_password: password,
            });
            navigate('/login', {
                replace: true,
                state: { message: 'Contraseña actualizada. Ya puedes iniciar sesión.' },
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.card}>
                <h2 className={styles.title}>Restablecer contraseña</h2>
                <p className={styles.subtitle}>
                    Elige una nueva contraseña para tu cuenta.
                </p>

                {tokenMissing ? (
                    <>
                        <p className={styles.errorMessage}>
                            El enlace de recuperación es inválido, expiró o está incompleto.
                        </p>
                        <div className={styles.footerLink}>
                            <Link to="/recuperar-contrasena" className={styles.linkBtn}>
                                Solicitar un nuevo enlace
                            </Link>
                        </div>
                    </>
                ) : (
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="reset-password">Nueva contraseña</label>
                            <input
                                id="reset-password"
                                type="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                placeholder="Mínimo 8 caracteres"
                                required
                                autoComplete="new-password"
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="reset-confirm-password">Confirmar contraseña</label>
                            <input
                                id="reset-confirm-password"
                                type="password"
                                value={confirmPassword}
                                onChange={(event) => setConfirmPassword(event.target.value)}
                                placeholder="Repite tu contraseña"
                                required
                                autoComplete="new-password"
                            />
                        </div>

                        {error && <p className={styles.errorMessage}>{error}</p>}

                        <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                            {isLoading ? 'Actualizando...' : 'Guardar contraseña'}
                        </button>
                    </form>
                )}

                <div className={styles.footerLink}>
                    <Link to="/login" className={styles.linkBtn}>Volver al inicio de sesión</Link>
                </div>
            </div>
        </div>
    );
}
