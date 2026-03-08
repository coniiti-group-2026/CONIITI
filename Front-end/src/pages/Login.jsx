// ============================================================
// Página de Inicio de Sesión — CONIITI Front-end
// Flujo en dos pasos:
//   1. Ingreso de email y contraseña (o botones OAuth)
//   2. Redirección a /verificar-otp para ingresar el código
// ============================================================

import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import { FaMicrosoft, FaGoogle } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import { login, loginWithMicrosoft, loginWithGoogle } from '../services/authService';
import { loginParticlesConfig } from '../utils/particlesConfig';
import styles from '../styles/pages/Login.module.css';

export default function Login() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [email, setEmail]         = useState('');
    const [password, setPassword]   = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError]         = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [engineReady, setEngineReady] = useState(false);

    // Recuperar email guardado si existe
    useEffect(() => {
        const saved = localStorage.getItem('coniiti_saved_email');
        if (saved) {
            setEmail(saved);
            setRememberMe(true);
        }
    }, []);

    // Inicializa el motor de partículas una sola vez
    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadSlim(engine);
        }).then(() => setEngineReady(true));
    }, []);

    // Redirige si el usuario ya está autenticado
    useEffect(() => {
        if (user) {
            const destination = user.role === 'superuser' ? '/superusuario' : '/';
            navigate(destination, { replace: true });
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        // Guardar o borrar email según el checkbox
        if (rememberMe) {
            localStorage.setItem('coniiti_saved_email', email);
        } else {
            localStorage.removeItem('coniiti_saved_email');
        }
        try {
            await login({ email, password });
            navigate(`/verificar-otp?email=${encodeURIComponent(email)}&purpose=login`);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
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
                <h2 className={styles.title}>Iniciar Sesión</h2>
                <p className={styles.subtitle}>Ingresa a la plataforma CONIITI</p>

                {/* Botones OAuth */}
                <div className={styles.oauthSection}>
                    <button
                        type="button"
                        className={styles.microsoftBtn}
                        onClick={loginWithMicrosoft}
                    >
                        <FaMicrosoft />
                        Continuar con Microsoft
                    </button>
                    <button
                        type="button"
                        className={styles.googleBtn}
                        onClick={loginWithGoogle}
                    >
                        <FaGoogle />
                        Continuar con Google
                    </button>
                </div>

                <div className={styles.divider}>
                    <span>o con email y contraseña</span>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="login-email">Correo Electrónico</label>
                        <input
                            type="email"
                            id="login-email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="tu@correo.com"
                            required
                            autoComplete="email"
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="login-password">Contraseña</label>
                        <input
                            type="password"
                            id="login-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Tu contraseña"
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    {/* Recordar datos + Olvidé contraseña */}
                    <div className={styles.rememberRow}>
                        <label className={styles.rememberLabel}>
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className={styles.rememberCheck}
                            />
                            Recordar mis datos
                        </label>
                        <Link to="/recuperar-contrasena" className={styles.forgotLink}>
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </div>

                    {error && <p className={styles.errorMessage}>{error}</p>}

                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Verificando...' : 'Entrar'}
                    </button>
                </form>

                <div className={styles.registerLink}>
                    <span>¿No tienes cuenta? </span>
                    <Link to="/register" className={styles.linkBtn}>Regístrate acá</Link>
                </div>
            </div>
        </div>
    );
}
