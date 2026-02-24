import { useState } from 'react';
import styles from './App.module.css';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import Home from './pages/Home';
import Agenda from './pages/Agenda';
import Memories from './pages/Memories';
import About from './pages/About';
import Contact from './pages/Contact';
import Pages from './pages/Paginas';
import MyConferences from './pages/MyConferences';

export default function App() {
    const [currentPage, setCurrentPage] = useState('Agenda');

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

    const renderPage = () => {
        switch (currentPage) {
            case 'Inicio': return <Home />;
            case 'Agenda': return <Agenda registeredIds={registeredIds} onToggleRegister={toggleRegistered} />;
            case 'Mis Conferencias': return <MyConferences registeredIds={registeredIds} onToggleRegister={toggleRegistered} />;
            case 'Memorias': return <Memories />;
            case 'Acerca de': return <About />;
            case 'Contacto': return <Contact />;
            case 'Páginas': return <Pages />;
            default: return <Agenda registeredIds={registeredIds} onToggleRegister={toggleRegistered} />;
        }
    };

    return (
        <div className={styles.app}>
            <Navbar
                onNavigate={setCurrentPage}
                activePage={currentPage}
                registeredCount={registeredIds.size}
            />
            <main className={styles.main}>
                {renderPage()}
            </main>
            <Footer />
        </div>
    );
}