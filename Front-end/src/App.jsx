import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import Login from './pages/Login';
import Register from './pages/Register';
import StaffDashboard from './pages/StaffDashboard';
import ProtectedRoute from './components/ProtectedRoute';

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
        <BrowserRouter>
            <AppLayout registeredIds={registeredIds} toggleRegistered={toggleRegistered} />
        </BrowserRouter>
    );
}

/** Layout interno con acceso a useLocation para saber si estamos en /staff */
function AppLayout({ registeredIds, toggleRegistered }) {
    const location = useLocation();
    const isStaff = location.pathname === '/staff';

    return (
        <div className={styles.app}>
            <Navbar registeredCount={registeredIds.size} />
            {isStaff ? (
                // El panel de staff ocupa el ancho completo sin restricción de max-width
                <div className={styles.staffWrapper}>
                    <Routes>
                        <Route
                            path="/staff"
                            element={
                                <ProtectedRoute role="staff">
                                    <StaffDashboard />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </div>
            ) : (
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
                        <Route path="/register" element={<Register />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </main>
            )}
            <Footer />
        </div>
    );
}
