import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import { loginParticlesConfig } from '../utils/particlesConfig';
import { cacheOtpDebugInfo, register } from '../services/authService';
import styles from '../styles/pages/Register.module.css';

export default function Register() {
    const navigate = useNavigate();
    const [engineReady, setEngineReady] = useState(false);
    const [form, setForm] = useState({
        nombre: '',
        apellido: '',
        email: '',
        institucion: '',
        tipoUsuario: 'external',
        password: '',
        confirmPassword: '',
        acceptPolicy: false,
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadSlim(engine);
        }).then(() => setEngineReady(true));
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }
        if (form.password.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres.');
            return;
        }
        if (!form.acceptPolicy) {
            setError('Debes aceptar la política de datos para registrarte.');
            return;
        }

        setIsLoading(true);
        setError('');
        try {
            const result = await register({
                full_name: `${form.nombre} ${form.apellido}`.trim(),
                email: form.email,
                institution: form.institucion || undefined,
                role: form.tipoUsuario,
                password: form.password,
            });

            const otpEmail = encodeURIComponent(result.email ?? form.email);
            const otpPurpose = encodeURIComponent(result.purpose ?? 'register');
            cacheOtpDebugInfo({
                email: result.email ?? form.email,
                purpose: result.purpose ?? 'register',
                debugOtp: result.debug_otp,
                message: result.message,
                deliveryMode: result.delivery_mode,
            });
            navigate(`/verificar-otp?email=${otpEmail}&purpose=${otpPurpose}`, {
                replace: true,
                state: {
                    message: result.message,
                    debugOtp: result.debug_otp,
                    deliveryMode: result.delivery_mode,
                },
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.registerContainer}>
            {engineReady && (
                <Particles
                    id="tsparticles-register"
                    options={loginParticlesConfig}
                    className={styles.particlesBackground}
                />
            )}

            <div className={styles.registerCard}>
                <h2 className={styles.title}>Crear cuenta</h2>
                <p className={styles.subtitle}>Completa tus datos para registrarte en CONIITI</p>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.row}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="reg-nombre">Nombre*</label>
                            <input
                                type="text"
                                id="reg-nombre"
                                name="nombre"
                                value={form.nombre}
                                onChange={handleChange}
                                placeholder="Tu nombre"
                                required
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label htmlFor="reg-apellido">Apellido*</label>
                            <input
                                type="text"
                                id="reg-apellido"
                                name="apellido"
                                value={form.apellido}
                                onChange={handleChange}
                                placeholder="Tu apellido"
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="reg-email">Correo electrónico*</label>
                        <input
                            type="email"
                            id="reg-email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="tu@correo.com"
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="reg-institucion">Institución / empresa</label>
                        <input
                            type="text"
                            id="reg-institucion"
                            name="institucion"
                            value={form.institucion}
                            onChange={handleChange}
                            placeholder="Universidad / empresa (opcional)"
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="reg-tipoUsuario">Tipo de participante*</label>
                        <select
                            id="reg-tipoUsuario"
                            name="tipoUsuario"
                            value={form.tipoUsuario}
                            onChange={handleChange}
                            required
                        >
                            <option value="student">Comunidad interna (estudiante / docente)</option>
                            <option value="external">Externo</option>
                        </select>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="reg-password">Contraseña* (mín. 8)</label>
                            <input
                                type="password"
                                id="reg-password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Mínimo 8 caracteres"
                                required
                                autoComplete="new-password"
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label htmlFor="reg-confirmPassword">Confirmar contraseña*</label>
                            <input
                                type="password"
                                id="reg-confirmPassword"
                                name="confirmPassword"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                placeholder="Repite tu contraseña"
                                required
                                autoComplete="new-password"
                            />
                        </div>
                    </div>

                    <div className={styles.checkboxGroup}>
                        <input
                            type="checkbox"
                            id="reg-acceptPolicy"
                            name="acceptPolicy"
                            checked={form.acceptPolicy}
                            onChange={handleChange}
                        />
                        <label htmlFor="reg-acceptPolicy">
                            Acepto la política de datos de CONIITI *
                        </label>
                    </div>

                    {error && <p className={styles.errorMessage}>{error}</p>}

                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Registrando...' : 'Crear cuenta'}
                    </button>
                </form>

                <div className={styles.loginLink}>
                    <span>¿Ya tienes cuenta? </span>
                    <Link to="/login" className={styles.linkBtn}>Inicia sesión</Link>
                </div>
            </div>
        </div>
    );
}
