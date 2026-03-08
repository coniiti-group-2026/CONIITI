// ============================================================
// App.jsx — Punto de Entrada de Rutas — CONIITI Front-end
// Configura el enrutador, el AuthProvider y todas las rutas
// de la aplicación incluyendo las nuevas rutas protegidas.
// ============================================================

import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

import { AuthProvider, useAuth } from './context/AuthContext';
import { getRegisteredSessions, toggleRegistration } from './services/agendaService';
import styles from './styles/App.module.css';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Agenda from './pages/Agenda';
import Memorias from './pages/Memorias';
import About from './pages/Acerca';
import Contact from './pages/Contactos';
import Pages from './pages/Paginas';
import MyConferences from './pages/MyConferences';
import Comite from './pages/Comite';
import Conferencistas from './pages/Conferencistas';
import Autores from './pages/Autores';
import Galerias from './pages/Galerias';
import Login from './pages/Login';
import Register from './pages/Register';
import OTPVerification from './pages/OTPVerification';
import StaffDashboard from './pages/StaffDashboard';
import SuperuserDashboard from './pages/SuperuserDashboard';
import ForgotPassword from './pages/ForgotPassword';

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <AppLayout />
            </BrowserRouter>
        </AuthProvider>
    );
}

/**
 * AppLayout — componente interno con acceso a useLocation y Auth.
 * Gestiona el diseño condicional para rutas de dashboard (full width)
 * versus rutas públicas con Navbar y Footer.
 */
function AppLayout() {
    const location = useLocation();
    const { user } = useAuth();
    
    // 1. Inicializar con los datos de localStorage si existen (Pre-Login caching)
    const [registeredIds, setRegisteredIds] = useState(() => {
        try {
            const saved = localStorage.getItem('coniiti_pre_registrations');
            if (saved) return new Set(JSON.parse(saved));
        } catch (e) {
            console.error('Error reading localStorage', e);
        }
        return new Set();
    });

    // 2. Persistir localmente cada vez que el estado cambie
    useEffect(() => {
        try {
            localStorage.setItem('coniiti_pre_registrations', JSON.stringify([...registeredIds]));
        } catch (e) {}
    }, [registeredIds]);

    // 3. Traer del servidor cuando el usuario se loguea (hidratación remota)
    useEffect(() => {
        if (user) {
            getRegisteredSessions()
                .then(sessions => {
                    const ids = new Set(sessions.map(s => s.id));
                    setRegisteredIds(ids);
                })
                .catch(console.error);
        } else {
            // Opcional: limpiar al cerrar sesión, o mantener lo local
            // setRegisteredIds(new Set()); 
        }
    }, [user]);

    // 4. Alternar inscripción e intentar guardar en nube si hay usuario
    const toggleRegistered = async (sessionId) => {
        const previousSet = new Set(registeredIds);
        
        // Optimistic UI update
        setRegisteredIds((prev) => {
            const next = new Set(prev);
            if (next.has(sessionId)) next.delete(sessionId);
            else next.add(sessionId);
            return next;
        });

        // Persistencia asíncrona en Backend
        if (user) {
            try {
                await toggleRegistration(sessionId);
            } catch (err) {
                console.error("Error al persistir en servidor:", err);
                setRegisteredIds(previousSet); // Revertir si falla el server
            }
        }
    };

    // Rutas de dashboard que ocupan ancho completo sin márgenes
    const isDashboard = ['/staff', '/superusuario'].includes(location.pathname);

    return (
        <div className={styles.app}>
            <Navbar registeredCount={registeredIds.size} />

            {isDashboard ? (
                <div className={styles.staffWrapper}>
                    <Routes>
                        <Route
                            path="/staff"
                            element={
                                <ProtectedRoute roles={['staff', 'superuser']}>
                                    <StaffDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/superusuario"
                            element={
                                <ProtectedRoute roles={['superuser']}>
                                    <SuperuserDashboard />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </div>
            ) : (
                <main className={styles.main}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route
                            path="/agenda"
                            element={
                                <div className={styles.agendaProtectedWrapper}>
                                    <Agenda
                                        registeredIds={registeredIds}
                                        onToggleRegister={toggleRegistered}
                                    />
                                </div>
                            }
                        />
                        <Route
                            path="/mis-conferencias"
                            element={
                                <MyConferences
                                    registeredIds={registeredIds}
                                    onToggleRegister={toggleRegistered}
                                />
                            }
                        />
                        <Route path="/memorias" element={<Memorias />} />
                        <Route path="/acerca-de" element={<About />} />
                        <Route path="/contacto" element={<Contact />} />
                        <Route path="/comite" element={<Comite />} />
                        <Route path="/conferencistas" element={<Conferencistas />} />
                        <Route path="/autores" element={<Autores />} />
                        <Route path="/galerias" element={<Galerias />} />
                        <Route path="/paginas" element={<Pages />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/verificar-otp" element={<OTPVerification />} />
                        <Route path="/recuperar-contrasena" element={<ForgotPassword />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </main>
            )}

            <Footer />
        </div>
    );
}
