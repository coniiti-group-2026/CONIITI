import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import styles from '../styles/pages/Login.module.css';

export default function Login() {

    const { login } = useContext(AuthContext);


    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault(); // Evita que la página recargue al mandar el formulario

        // --- 1. AQUÍ IRÁ LA LLAMADA AL BACK-END MÁS ADELANTE ---
        // Pero por ahora, simulamos el login basándonos en el correo:

        if (email === 'admin@coniiti.edu.co') {
            login('staff'); // Le decimos al cerebro que entró como staff
            // navigate('/staff-dashboard'); // Redirigimos al panel crudo
            alert("¡Bienvenido, miembro del Staff!");
        } else {
            login('normal'); // Le decimos al cerebro que es usuario regular
            // navigate('/'); // Lo devolvemos a la agenda
            alert("Bienvenido, usuario.");
        }
    };

    return (
        <div className={styles.loginContainer}>
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
                    <button type="button" className={styles.linkBtn}>Regístrate acá</button>
                </div>
            </div>
        </div>
    );
}
