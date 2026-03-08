// ============================================================
// App.jsx — Punto de Entrada de Rutas — CONIITI Front-end
// Configura el enrutador, el AuthProvider y todas las rutas
// de la aplicación incluyendo las nuevas rutas protegidas.
// ============================================================

import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState } from 'react';

import { AuthProvider } from './context/AuthContext';
import styles from './styles/App.module.css';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Agenda from './pages/Agenda';
import Memories from './pages/Memories';
import About from './pages/About';
import Contact from './pages/Contact';
import Pages from './pages/Paginas';
import MyConferences from './pages/MyConferences';
import Login from './pages/Login';
import Register from './pages/Register';
import OTPVerification from './pages/OTPVerification';
import StaffDashboard from './pages/StaffDashboard';
import SuperuserDashboard from './pages/SuperuserDashboard';

export default function App() {
    const [registeredIds, setRegisteredIds] = useState(new Set());

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
        <AuthProvider>
            <BrowserRouter>
                <AppLayout registeredIds={registeredIds} toggleRegistered={toggleRegistered} />
            </BrowserRouter>
        </AuthProvider>
    );
}

/**
 * AppLayout — componente interno con acceso a useLocation.
 * Gestiona el diseño condicional para rutas de dashboard (full width)
 * versus rutas públicas con Navbar y Footer.
 */
function AppLayout({ registeredIds, toggleRegistered }) {
    const location = useLocation();

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
                                <Agenda
                                    registeredIds={registeredIds}
                                    onToggleRegister={toggleRegistered}
                                />
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
                        <Route path="/memorias" element={<Memories />} />
                        <Route path="/acerca-de" element={<About />} />
                        <Route path="/contacto" element={<Contact />} />
                        <Route path="/paginas" element={<Pages />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/verificar-otp" element={<OTPVerification />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </main>
            )}

            <Footer />
        </div>
    );
}
