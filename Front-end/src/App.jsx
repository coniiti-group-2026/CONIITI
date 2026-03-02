import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import styles from './styles/App.module.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Agenda from './pages/Agenda';
import Memories from './pages/Memories';
import About from './pages/About';
import Contact from './pages/Contact';
import Pages from './pages/Paginas';
import MyConferences from './pages/MyConferences';
import Login from './pages/Login'; // Importamos la nueva vista de Login

export default function App() {
    // Estado global de sesiones pre-inscritas: Set de IDs
    const [registeredIds, setRegisteredIds] = useState(new Set());

    // Toggle: agrega o quita una sesión de "Mis Conferencias"
    const toggleRegistered = (sessionId) => {
        setRegisteredIds((prev) => {
            const next = new Set(prev);
            if (next.has(sessionId)) {
                next.delete(sessionId);
            } else {
                next.add(sessionId);
            }
            return next;
        });
    };

    return (
        <BrowserRouter>
            <div className={styles.app}>
                <Navbar registeredCount={registeredIds.size} />
                <main className={styles.main}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/agenda" element={<Agenda registeredIds={registeredIds} onToggleRegister={toggleRegistered} />} />
                        <Route path="/mis-conferencias" element={<MyConferences registeredIds={registeredIds} onToggleRegister={toggleRegistered} />} />
                        <Route path="/memorias" element={<Memories />} />
                        <Route path="/acerca-de" element={<About />} />
                        <Route path="/contacto" element={<Contact />} />
                        <Route path="/paginas" element={<Pages />} />
                        <Route path="/login" element={<Login />} />
                        {/* Ruta por defecto (404 o fallback) */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </BrowserRouter>
    );
}