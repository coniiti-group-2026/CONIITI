// ============================================================
// Página de Recuperación de Contraseña — CONIITI Front-end
// Flujo en dos pasos:
//   1. Ingresa tu correo → se envía código OTP
//   2. Ingresa el código + nueva contraseña
// Solo disponible para clientes (student, external).
// ============================================================

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import { loginParticlesConfig } from '../utils/particlesConfig';
import { forgotPassword, resetPassword } from '../services/authService';
import styles from '../styles/pages/ForgotPassword.module.css';

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [engineReady, setEngineReady] = useState(false);

    const [step, setStep]           = useState(1);
    const [email, setEmail]         = useState('');
    const [code, setCode]           = useState('');
    const [newPw, setNewPw]         = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [error, setError]         = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadSlim(engine);
        }).then(() => setEngineReady(true));
    }, []);

    // ── Paso 1: Solicitar OTP ──────────────────────────────────
    const handleRequestCode = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await forgotPassword(email);
            setStep(2);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // ── Paso 2: Restablecer contraseña ─────────────────────────
    const handleReset = async (e) => {
        e.preventDefault();
        setError('');
        if (newPw !== confirmPw) {
            setError('Las contraseñas no coinciden.');
            return;
        }
        setIsLoading(true);
        try {
            await resetPassword(email, code, newPw);
            navigate('/login', {
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
            {engineReady && (
                <Particles
                    id="tsparticles-forgot"
                    options={loginParticlesConfig}
                    className={styles.particlesBackground}
                />
            )}

            <div className={styles.card}>
                {/* Icono */}
                <div className={styles.iconWrapper}>
                    <svg className={styles.icon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                    </svg>
                </div>

                {step === 1 ? (
                    <>
                        <h2 className={styles.title}>Recuperar Contraseña</h2>
                        <p className={styles.subtitle}>
                            Ingresa tu correo y te enviaremos un código para restablecer tu contraseña.
                        </p>

                        <form onSubmit={handleRequestCode} className={styles.form}>
                            <div className={styles.inputGroup}>
                                <label htmlFor="forgot-email">Correo Electrónico</label>
                                <input
                                    type="email"
                                    id="forgot-email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="tu@correo.com"
                                    required
                                    autoComplete="email"
                                />
                            </div>

                            {error && <p className={styles.errorMessage}>{error}</p>}

                            <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                                {isLoading ? 'Enviando...' : 'Enviar código'}
                            </button>
                        </form>
                    </>
                ) : (
                    <>
                        <h2 className={styles.title}>Ingresa el Código</h2>
                        <p className={styles.subtitle}>
                            Revisa tu correo <strong>{email}</strong> e ingresa el código de 6 dígitos junto con tu nueva contraseña.
                        </p>

                        <form onSubmit={handleReset} className={styles.form}>
                            <div className={styles.inputGroup}>
                                <label htmlFor="reset-code">Código de verificación</label>
                                <input
                                    type="text"
                                    id="reset-code"
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

                            <div className={styles.inputGroup}>
                                <label htmlFor="new-password">Nueva contraseña</label>
                                <input
                                    type="password"
                                    id="new-password"
                                    value={newPw}
                                    onChange={(e) => setNewPw(e.target.value)}
                                    placeholder="Mínimo 8 caracteres"
                                    minLength={8}
                                    required
                                    autoComplete="new-password"
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label htmlFor="confirm-password">Confirmar contraseña</label>
                                <input
                                    type="password"
                                    id="confirm-password"
                                    value={confirmPw}
                                    onChange={(e) => setConfirmPw(e.target.value)}
                                    placeholder="Repite tu nueva contraseña"
                                    minLength={8}
                                    required
                                    autoComplete="new-password"
                                />
                            </div>

                            {error && <p className={styles.errorMessage}>{error}</p>}

                            <button
                                type="submit"
                                className={styles.submitBtn}
                                disabled={isLoading || code.length !== 6}
                            >
                                {isLoading ? 'Actualizando...' : 'Restablecer contraseña'}
                            </button>
                        </form>

                        <p className={styles.resendHint}>
                            ¿No recibiste el código?{' '}
                            <button className={styles.linkBtn} onClick={() => setStep(1)}>
                                Volver a intentarlo
                            </button>
                        </p>
                    </>
                )}

                <div className={styles.footerLink}>
                    <Link to="/login" className={styles.linkBtn}>← Volver al inicio de sesión</Link>
                </div>
            </div>
        </div>
    );
}
