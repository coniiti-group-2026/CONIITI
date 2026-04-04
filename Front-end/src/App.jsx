// ============================================================
// App.jsx — Punto de Entrada de Rutas — CONIITI Front-end
// Configura el enrutador, el AuthProvider y todas las rutas
// de la aplicación incluyendo las nuevas rutas protegidas.
// ============================================================

import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect, Suspense, lazy } from 'react';

import { AuthProvider, useAuth } from './context/AuthContext';
import { getRegisteredSessions, toggleRegistration } from './services/agendaService';
import styles from './styles/App.module.css';

// Componentes estáticos críticos
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Páginas con carga perezosa para TBT Code Splitting
const Home = lazy(() => import('./pages/Home'));
const Agenda = lazy(() => import('./pages/Agenda'));
const Memorias = lazy(() => import('./pages/Memorias'));
const About = lazy(() => import('./pages/Acerca'));
const Contact = lazy(() => import('./pages/Contactos'));
const Pages = lazy(() => import('./pages/Paginas'));
const MyConferences = lazy(() => import('./pages/MyConferences'));
const Comite = lazy(() => import('./pages/Comite'));
const Conferencistas = lazy(() => import('./pages/Conferencistas'));
const Autores = lazy(() => import('./pages/Autores'));
const Galerias = lazy(() => import('./pages/Galerias'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const OTPVerification = lazy(() => import('./pages/OTPVerification'));
const StaffDashboard = lazy(() => import('./pages/StaffDashboard'));
const SuperuserDashboard = lazy(() => import('./pages/SuperuserDashboard'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));

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
    
    // 1. Inicializar vacío siempre salvo que haya user 
    // (Se llenará dinámicamente en el effect de user, previniendo lectura huérfana)
    const [registeredIds, setRegisteredIds] = useState(new Set());

    // 2. Persistir localmente cada vez que el estado cambie
    useEffect(() => {
        try {
            localStorage.setItem('coniiti_pre_registrations', JSON.stringify([...registeredIds]));
        } catch {
            // Ignore localStorage errors
        }
    }, [registeredIds]);

    // 3. Traer del servidor cuando el usuario se loguea (hidratación remota)
    useEffect(() => {
        if (user) {
            // Leer cache local temporal para no esperar a la red (Optimistic Loading)
            try {
                const saved = localStorage.getItem('coniiti_pre_registrations');
                if (saved) {
                    // eslint-disable-next-line react-hooks/set-state-in-effect
                    setRegisteredIds(new Set(JSON.parse(saved)));
                }
            } catch {
                // Ignore localStorage errors
            }

            getRegisteredSessions()
                .then(sessions => {
                    const ids = new Set(sessions.map(s => s.id));
                    setRegisteredIds(ids);
                })
                .catch(console.error);
        } else {
            // Purgar local storage y estado si el usuario cierra sesión
            setRegisteredIds(new Set()); 
            localStorage.removeItem('coniiti_pre_registrations');
        }
    }, [user]);

    // 4. Alternar inscripción e intentar guardar en nube si hay usuario
    const toggleRegistered = async (sessionId) => {
        if (!user) {
            alert('Debes iniciar sesión para preinscribirte en las conferencias.');
            return;
        }

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
                    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Cargando paneles admin...</div>}>
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
                    </Suspense>
                </div>
            ) : (
                <main className={styles.main}>
                    <Suspense fallback={<div style={{ padding: '4rem 2rem', textAlign: 'center', height: '100vh' }}>Cargando página...</div>}>
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
                            <Route path="/restablecer-contrasena" element={<ResetPassword />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </Suspense>
                </main>
            )}

            <Footer />
        </div>
    );
}
