// ============================================================
// Página de Verificación OTP — CONIITI Front-end
// Recibe el código de 6 dígitos enviado al correo del usuario.
// Funciona tanto para el flujo de registro como para
// el inicio de sesión (local y OAuth).
// ============================================================

import { useState, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import { loginParticlesConfig } from '../utils/particlesConfig';
import { verifyOtp } from '../services/authService';
import { AuthContext } from '../context/AuthContext';
import { getMe } from '../services/authService';
import styles from '../styles/pages/OTPVerification.module.css';

export default function OTPVerification() {
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email') ?? '';
    const purpose = searchParams.get('purpose') ?? 'login';

    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [engineReady, setEngineReady] = useState(false);

    const navigate = useNavigate();
    const { setUser } = useContext(AuthContext);

    // Redirige si no hay email en la URL (acceso directo inválido)
    useEffect(() => {
        if (!email) navigate('/login', { replace: true });
    }, [email, navigate]);

    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadSlim(engine);
        }).then(() => setEngineReady(true));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await verifyOtp({ email, code, purpose });

            // Carga el perfil del usuario tras la verificación exitosa
            const userData = await getMe();
            setUser(userData);

            // Redirige según el rol
            if (userData?.role === 'superuser') {
                navigate('/superusuario', { replace: true });
            } else if (userData?.role === 'staff') {
                navigate('/staff', { replace: true });
            } else {
                navigate('/', { replace: true });
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const purposeLabel = purpose === 'register'
        ? 'completar tu registro'
        : 'confirmar tu inicio de sesión';

    return (
        <div className={styles.otpContainer}>
            {engineReady && (
                <Particles
                    id="tsparticles-otp"
                    options={loginParticlesConfig}
                    className={styles.particlesBackground}
                />
            )}

            <div className={styles.otpCard}>
                <div className={styles.iconWrapper}>
                    <svg className={styles.icon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                </div>

                <h2 className={styles.title}>Verificación de Seguridad</h2>
                <p className={styles.subtitle}>
                    Se envió un código de 6 dígitos a{' '}
                    <strong>{email}</strong> para {purposeLabel}.
                </p>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="otp-code">Código de verificación</label>
                        <input
                            type="text"
                            id="otp-code"
                            className={styles.codeInput}
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="000000"
                            maxLength={6}
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            required
                        />
                    </div>

                    {error && <p className={styles.errorMessage}>{error}</p>}

                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={isLoading || code.length !== 6}
                    >
                        {isLoading ? 'Verificando...' : 'Verificar código'}
                    </button>
                </form>

                <p className={styles.hint}>
                    El código expira en <strong>10 minutos</strong>.
                    Revisa también tu carpeta de spam.
                </p>
            </div>
        </div>
    );
}
