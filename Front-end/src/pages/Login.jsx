import { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import { FaGoogle, FaMicrosoft } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import {
    getGoogleLoginUrl,
    getMe,
    getMicrosoftLoginUrl,
    login,
    loginWithGoogle,
    loginWithMicrosoft,
} from '../services/authService';
import { loginParticlesConfig } from '../utils/particlesConfig';
import styles from '../styles/pages/Login.module.css';

function getDestinationForUser(userData) {
    return userData.role === 'superuser' ? '/superusuario' : userData.role === 'staff' ? '/staff' : '/';
}

export default function Login() {
    const { user, setUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [engineReady, setEngineReady] = useState(false);
    const [infoMessage, setInfoMessage] = useState('');
    const [isRestoringOAuthSession, setIsRestoringOAuthSession] = useState(false);
    const microsoftLoginUrl = getMicrosoftLoginUrl();
    const googleLoginUrl = getGoogleLoginUrl();

    useEffect(() => {
        const saved = localStorage.getItem('coniiti_saved_email');
        if (saved) {
            setEmail(saved);
            setRememberMe(true);
        }
    }, []);

    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadSlim(engine);
        }).then(() => setEngineReady(true));
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const oauthError = params.get('error');
        const oauthSuccess = params.get('oauth');
        setError(oauthError ?? '');
        setInfoMessage(
            oauthSuccess === 'success'
                ? ''
                : location.state?.message ?? ''
        );
    }, [location.search, location.state]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('oauth') !== 'success') {
            return undefined;
        }

        let isCancelled = false;

        const restoreOAuthSession = async () => {
            setError('');
            setInfoMessage('');
            setIsRestoringOAuthSession(true);

            for (let attempt = 0; attempt < 3; attempt += 1) {
                const userData = await getMe();
                if (isCancelled) {
                    return;
                }

                if (userData) {
                    setUser(userData);
                    navigate(getDestinationForUser(userData), { replace: true });
                    return;
                }

                await new Promise((resolve) => {
                    window.setTimeout(resolve, 300 * (attempt + 1));
                });
            }

            if (!isCancelled) {
                setError('La autenticacion externa se completo, pero no pudimos restaurar la sesion.');
                setIsRestoringOAuthSession(false);
            }
        };

        restoreOAuthSession();

        return () => {
            isCancelled = true;
        };
    }, [location.search, navigate, setUser]);

    useEffect(() => {
        if (user) {
            navigate(getDestinationForUser(user), { replace: true });
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setInfoMessage('');
        setIsLoading(true);
        setIsRestoringOAuthSession(false);

        if (rememberMe) {
            localStorage.setItem('coniiti_saved_email', email);
        } else {
            localStorage.removeItem('coniiti_saved_email');
        }

        try {
            await login({ email, password });
            const userData = await getMe();
            setUser(userData);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMicrosoftLogin = () => {
        setError('');
        setInfoMessage('');
        loginWithMicrosoft();
    };

    const handleGoogleLogin = () => {
        setError('');
        setInfoMessage('');
        loginWithGoogle();
    };

    return (
        <div className={styles.loginContainer}>
            {engineReady && (
                <Particles
                    id="tsparticles"
                    options={loginParticlesConfig}
                    className={styles.particlesBackground}
                />
            )}

            <div className={styles.loginCard}>
                <h2 className={styles.title}>Iniciar sesion</h2>
                <p className={styles.subtitle}>Ingresa a la plataforma CONIITI</p>

                <div className={styles.oauthSection}>
                    <a
                        href={microsoftLoginUrl}
                        className={styles.microsoftBtn}
                        onClick={(event) => {
                            event.preventDefault();
                            handleMicrosoftLogin();
                        }}
                        aria-disabled={isLoading || isRestoringOAuthSession}
                    >
                        <FaMicrosoft />
                        Continuar con Microsoft
                    </a>
                    <a
                        href={googleLoginUrl}
                        className={styles.googleBtn}
                        onClick={(event) => {
                            event.preventDefault();
                            handleGoogleLogin();
                        }}
                        aria-disabled={isLoading || isRestoringOAuthSession}
                    >
                        <FaGoogle />
                        Continuar con Google
                    </a>
                </div>

                <div className={styles.divider} />

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="login-email">Correo electronico</label>
                        <input
                            type="email"
                            id="login-email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="tu@correo.com"
                            required
                            autoComplete="email"
                            disabled={isLoading || isRestoringOAuthSession}
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="login-password">Contrasena</label>
                        <input
                            type="password"
                            id="login-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Tu contrasena"
                            required
                            autoComplete="current-password"
                            disabled={isLoading || isRestoringOAuthSession}
                        />
                    </div>

                    <div className={styles.rememberRow}>
                        <label className={styles.rememberLabel}>
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className={styles.rememberCheck}
                                disabled={isLoading || isRestoringOAuthSession}
                            />
                            Recordar mi correo
                        </label>
                        <Link to="/recuperar-contrasena" className={styles.forgotLink}>
                            Olvide mi contrasena
                        </Link>
                    </div>

                    {infoMessage && <p className={styles.successMessage}>{infoMessage}</p>}
                    {error && <p className={styles.errorMessage}>{error}</p>}

                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={isLoading || isRestoringOAuthSession}
                    >
                        {isLoading || isRestoringOAuthSession ? 'Ingresando...' : 'Entrar'}
                    </button>
                </form>

                <div className={styles.registerLink}>
                    <span>No tienes cuenta? </span>
                    <Link to="/register" className={styles.linkBtn}>Crea tu cuenta</Link>
                </div>
            </div>
        </div>
    );
}
