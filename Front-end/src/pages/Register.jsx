// ============================================================
// Página de Registro — CONIITI Front-end
// Registra un nuevo usuario en la plataforma.
// Al enviar el formulario, redirige a /verificar-otp
// para completar la verificación por correo.
// ============================================================

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import { loginParticlesConfig } from '../utils/particlesConfig';
import { register } from '../services/authService';
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
            setError('Debe aceptar la política de datos para registrarse.');
            return;
        }

        setIsLoading(true);
        setError('');
        try {
            await register({
                full_name: `${form.nombre} ${form.apellido}`.trim(),
                email: form.email,
                institution: form.institucion || undefined,
                role: form.tipoUsuario,
                password: form.password,
                accept_data_policy: form.acceptPolicy,
            });
            // Redirige a la verificación OTP después del registro
            navigate(`/verificar-otp?email=${encodeURIComponent(form.email)}&purpose=register`);
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
                <h2 className={styles.title}>Crear Cuenta</h2>
                <p className={styles.subtitle}>Únete a la plataforma CONIITI 2026</p>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {/* Nombre y Apellido */}
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

                    {/* Correo */}
                    <div className={styles.inputGroup}>
                        <label htmlFor="reg-email">Correo Electrónico*</label>
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

                    {/* Institución */}
                    <div className={styles.inputGroup}>
                        <label htmlFor="reg-institucion">Institución / Empresa</label>
                        <input
                            type="text"
                            id="reg-institucion"
                            name="institucion"
                            value={form.institucion}
                            onChange={handleChange}
                            placeholder="Universidad / Empresa (opcional)"
                        />
                    </div>

                    {/* Tipo de Usuario */}
                    <div className={styles.inputGroup}>
                        <label htmlFor="reg-tipoUsuario">Tipo de Participante*</label>
                        <select
                            id="reg-tipoUsuario"
                            name="tipoUsuario"
                            value={form.tipoUsuario}
                            onChange={handleChange}
                            required
                        >
                            <option value="student">Comunidad Interna (Estudiante / Docente)</option>
                            <option value="external">Externo</option>
                        </select>
                    </div>

                    {/* Contraseñas */}
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
                            <label htmlFor="reg-confirmPassword">Confirmar Contraseña*</label>
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

                    {/* Política de datos */}
                    <div className={styles.checkboxGroup}>
                        <input
                            type="checkbox"
                            id="reg-acceptPolicy"
                            name="acceptPolicy"
                            checked={form.acceptPolicy}
                            onChange={handleChange}
                        />
                        <label htmlFor="reg-acceptPolicy">
                            Acepto la{' '}
                            <a href="/politica-de-datos" target="_blank" rel="noopener noreferrer">
                                política de datos
                            </a>{' '}
                            de CONIITI *
                        </label>
                    </div>

                    {error && <p className={styles.errorMessage}>{error}</p>}

                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Registrando...' : 'Crear Cuenta'}
                    </button>
                </form>

                <div className={styles.loginLink}>
                    <span>¿Ya tienes cuenta? </span>
                    <Link to="/login" className={styles.linkBtn}>Inicia sesión acá</Link>
                </div>
            </div>
        </div>
    );
}
