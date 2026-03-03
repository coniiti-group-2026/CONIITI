import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import { loginParticlesConfig } from '../utils/particlesConfig';
import styles from '../styles/pages/Register.module.css';

/**
 * Register — Página de Registro de nuevo usuario.
 * Comparte el fondo animado de partículas con la página de Login.
 */
export default function Register() {
    const navigate = useNavigate();
    const [engineReady, setEngineReady] = useState(false);
    const [form, setForm] = useState({
        nombre: '',
        apellido: '',
        email: '',
        institucion: '',
        tipoUsuario: 'comunidad-interna',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');

    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadSlim(engine);
        }).then(() => setEngineReady(true));
    }, []);

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }
        if (form.password.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres.');
            return;
        }
        // Por ahora solo simulamos el registro exitoso
        alert(`¡Registro exitoso! Bienvenido/a, ${form.nombre}. Ya puedes iniciar sesión.`);
        navigate('/login');
    };

    return (
        <div className={styles.registerContainer}>
            {/* Fondo de partículas */}
            {engineReady && (
                <Particles
                    id="tsparticles-register"
                    options={loginParticlesConfig}
                    className={styles.particlesBackground}
                />
            )}

            <div className={styles.registerCard}>
                <h2 className={styles.title}>Crear Cuenta</h2>
                <p className={styles.subtitle}>Únete a la plataforma CONIITI 2026 v1</p>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {/* Nombre y Apellido */}
                    <div className={styles.row}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="nombre">Nombre *</label>
                            <input
                                type="text"
                                id="nombre"
                                name="nombre"
                                value={form.nombre}
                                onChange={handleChange}
                                placeholder="Tu nombre"
                                required
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label htmlFor="apellido">Apellido *</label>
                            <input
                                type="text"
                                id="apellido"
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
                        <label htmlFor="email">Correo Electrónico *</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="tu@correo.com"
                            required
                        />
                    </div>

                    {/* Institución */}
                    <div className={styles.inputGroup}>
                        <label htmlFor="institucion">Institución / Empresa</label>
                        <input
                            type="text"
                            id="institucion"
                            name="institucion"
                            value={form.institucion}
                            onChange={handleChange}
                            placeholder="Universidad / Empresa"
                        />
                    </div>

                    {/* Tipo de Usuario */}
                    <div className={styles.inputGroup}>
                        <label htmlFor="tipoUsuario">Tipo de Participante *</label>
                        <select
                            id="tipoUsuario"
                            name="tipoUsuario"
                            value={form.tipoUsuario}
                            onChange={handleChange}
                            required
                        >
                            <option value="staff">Staff</option>
                            <option value="comunidad-interna">Comunidad Interna</option>
                            <option value="externo">Externo</option>
                        </select>
                    </div>

                    {/* Contraseña y Confirmar */}
                    <div className={styles.row}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="password">Contraseña *</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Mínimo 8 caracteres"
                                required
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label htmlFor="confirmPassword">Confirmar Contraseña *</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                placeholder="Repite tu contraseña"
                                required
                            />
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <p style={{ color: '#dc2626', fontSize: '0.85rem', margin: 0 }}>
                            {error}
                        </p>
                    )}

                    <button type="submit" className={styles.submitBtn}>
                        Crear Cuenta
                    </button>
                </form>

                <div className={styles.loginLink}>
                    <span>¿Ya tienes cuenta?</span>
                    <button
                        type="button"
                        className={styles.linkBtn}
                        onClick={() => navigate('/login')}
                    >
                        Inicia sesión acá
                    </button>
                </div>
            </div>
        </div>
    );
}
