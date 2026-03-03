import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/pages/Login.module.css';

// tsParticles v3: se inicializa con initParticlesEngine (no es un prop)
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { loginParticlesConfig } from '../utils/particlesConfig';

export default function Login() {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    // Flag: el motor solo se carga una vez
    const [engineReady, setEngineReady] = useState(false);

    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadSlim(engine);
        }).then(() => setEngineReady(true));
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (email === 'admin@coniiti.edu.co') {
            login('staff');
            navigate('/staff'); // Redirige al panel de administración
        } else {
            login('normal');
            navigate('/');     // Redirige a la página de inicio
        }
    };

    return (
        <div className={styles.loginContainer}>
            {/* Fondo de partículas — solo monta cuando el motor ya está listo */}
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

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="email">Correo Electrónico</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="tu@correo.com"
                            required
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="password">Contraseña</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="********"
                            required
                        />
                    </div>
                    <button type="submit" className={styles.submitBtn}>
                        Entrar
                    </button>
                </form>

                <div className={styles.registerLink}>
                    <span>¿No tienes cuenta? </span>
                    <button type="button" className={styles.linkBtn} onClick={() => navigate('/register')}>Regístrate acá</button>
                </div>
            </div>
        </div>
    );
}

