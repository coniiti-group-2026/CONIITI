import { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import { AuthContext } from '../context/AuthContext';
import {
    clearCachedOtpDebugInfo,
    getCachedOtpDebugInfo,
    getMe,
    verifyOtp,
} from '../services/authService';
import { loginParticlesConfig } from '../utils/particlesConfig';
import styles from '../styles/pages/OTPVerification.module.css';

function getDestinationForUser(userData) {
    return userData.role === 'superuser' ? '/superusuario' : userData.role === 'staff' ? '/staff' : '/';
}

export default function OTPVerification() {
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email') ?? '';
    const purpose = searchParams.get('purpose') ?? 'login';
    const location = useLocation();
    const navigate = useNavigate();
    const { setUser } = useContext(AuthContext);

    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [infoMessage, setInfoMessage] = useState(location.state?.message ?? '');
    const [debugOtp, setDebugOtp] = useState(location.state?.debugOtp ?? '');
    const [deliveryMode, setDeliveryMode] = useState(location.state?.deliveryMode ?? '');
    const [isLoading, setIsLoading] = useState(false);
    const [engineReady, setEngineReady] = useState(false);

    useEffect(() => {
        if (!email) {
            navigate('/login', { replace: true });
        }
    }, [email, navigate]);

    useEffect(() => {
        const cachedDebugInfo = getCachedOtpDebugInfo(email, purpose);
        if (!cachedDebugInfo) {
            return;
        }

        setInfoMessage((current) => current || cachedDebugInfo.message || '');
        setDebugOtp((current) => current || cachedDebugInfo.debugOtp || '');
        setDeliveryMode((current) => current || cachedDebugInfo.deliveryMode || '');
        setCode((current) => current || cachedDebugInfo.debugOtp || '');
    }, [email, purpose]);

    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadSlim(engine);
        }).then(() => setEngineReady(true));
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await verifyOtp({ email, code, purpose });
            const userData = await getMe({ force: true });
            if (!userData) {
                throw new Error('No pudimos restaurar la sesión después de verificar el código.');
            }
            clearCachedOtpDebugInfo(email, purpose);
            setUser(userData);
            navigate(getDestinationForUser(userData), { replace: true });
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
                        <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" />
                    </svg>
                </div>

                <h2 className={styles.title}>Verificación de seguridad</h2>
                <p className={styles.subtitle}>
                    Se envió un código de 6 dígitos a <strong>{email}</strong> para {purposeLabel}.
                </p>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="otp-code">Código de verificación</label>
                        <input
                            type="text"
                            id="otp-code"
                            className={styles.codeInput}
                            value={code}
                            onChange={(event) => {
                                setCode(event.target.value.replace(/\D/g, '').slice(0, 6));
                                setError('');
                                setInfoMessage('');
                            }}
                            placeholder="000000"
                            maxLength={6}
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            required
                        />
                    </div>

                    {infoMessage && <p className={styles.hint}>{infoMessage}</p>}
                    {deliveryMode === 'development_fallback' && debugOtp && (
                        <p className={styles.debugMessage}>
                            No pudimos entregar el mensaje en este momento. Usa este código temporal para continuar: <strong>{debugOtp}</strong>.
                        </p>
                    )}
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
                    Si no lo ves, revisa la carpeta de spam o inicia sesión de nuevo para generar otro.
                </p>
            </div>
        </div>
    );
}
