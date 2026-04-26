import { Link } from 'react-router-dom';
import { FaCheckCircle, FaExclamationTriangle, FaLock } from 'react-icons/fa';
import useResetPasswordForm from '../hooks/useResetPasswordForm';
import styles from '../styles/components/ResetPasswordForm.module.css';

export default function ResetPasswordForm({ token, onSuccess }) {
    const {
        password,
        confirmPassword,
        error,
        isLoading,
        tokenMissing,
        setPassword,
        setConfirmPassword,
        handleSubmit,
    } = useResetPasswordForm({ token, onSuccess });

    return (
        <div className={styles.pageContainer}>
            <section className={styles.card} aria-labelledby="reset-password-title">
                <div className={styles.iconBadge} aria-hidden="true">
                    <FaLock />
                </div>

                <h2 id="reset-password-title" className={styles.title}>
                    Restablecer contrase&ntilde;a
                </h2>
                <p className={styles.subtitle}>
                    Crea una contrase&ntilde;a nueva para recuperar el acceso a tu cuenta CONIITI.
                </p>

                {tokenMissing ? (
                    <div className={styles.alertBlock} role="alert">
                        <FaExclamationTriangle className={styles.alertIcon} aria-hidden="true" />
                        <div>
                            <p className={styles.alertTitle}>Enlace no valido</p>
                            <p className={styles.alertText}>
                                El enlace de recuperacion esta incompleto o expiro. Solicita uno nuevo para continuar.
                            </p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="reset-password">Nueva contrase&ntilde;a</label>
                            <input
                                id="reset-password"
                                type="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                placeholder="Minimo 8 caracteres"
                                required
                                minLength={8}
                                autoComplete="new-password"
                                disabled={isLoading}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="reset-confirm-password">Confirmar contrase&ntilde;a</label>
                            <input
                                id="reset-confirm-password"
                                type="password"
                                value={confirmPassword}
                                onChange={(event) => setConfirmPassword(event.target.value)}
                                placeholder="Repite tu contrase\u00f1a"
                                required
                                minLength={8}
                                autoComplete="new-password"
                                disabled={isLoading}
                            />
                        </div>

                        {error && <p className={styles.errorMessage}>{error}</p>}

                        <div className={styles.passwordHint}>
                            <FaCheckCircle aria-hidden="true" />
                            Usa al menos 8 caracteres.
                        </div>

                        <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                            {isLoading ? 'Actualizando...' : 'Guardar contrase\u00f1a'}
                        </button>
                    </form>
                )}

                <div className={styles.footerLink}>
                    {tokenMissing ? (
                        <Link to="/recuperar-contrasena" className={styles.linkBtn}>
                            Solicitar nuevo enlace
                        </Link>
                    ) : (
                        <Link to="/login" className={styles.linkBtn}>
                            Volver al inicio de sesion
                        </Link>
                    )}
                </div>
            </section>
        </div>
    );
}
