import { useState, useRef, useEffect, useContext } from 'react';
import { FiSearch, FiMenu, FiX, FiChevronDown, FiBookmark } from 'react-icons/fi';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/coniiti_logo.png';
import styles from '../styles/components/Navbar.module.css';

import { AuthContext } from '../context/AuthContext';

const LINKS = [
    { name: 'Inicio', path: '/' },
    { name: 'Agenda', path: '/agenda' },
    { name: 'Memorias', path: '/memorias' },
    { name: 'Acerca de', path: '/acerca-de' },
    { name: 'Contacto', path: '/contacto' }
];

export default function Navbar({ registeredCount = 0 }) {
    // Traer el contexto y hooks de router
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const activePage = location.pathname; // Ahora la página activa se basa en la URL

    const [menuOpen, setMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [agendaDropdownOpen, setAgendaDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Cierra el dropdown al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setAgendaDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const closeMenu = () => {
        setMenuOpen(false);
        setAgendaDropdownOpen(false);
    };

    return (
        <nav className={styles.navbar}>
            {/* ── Logo + Nombre ── */}
            <Link to="/" className={styles.brand} onClick={closeMenu}>
                <img src={logo} alt="Logo CONIITI" className={styles.logoImg} />
                <div className={styles.brandText}>
                    <span className={styles.brandName}>
                        <span className={styles.accent}>C</span>ONIITI
                    </span>
                    <span className={styles.brandEdition}>XI Edición · 2025</span>
                </div>
            </Link>

            {/* ── Links de navegación ── */}
            <ul className={`${styles.links} ${menuOpen ? styles.linksOpen : ''}`}>
                {LINKS.map((link) => {
                    // Link especial "Agenda" con dropdown
                    if (link.name === 'Agenda') {
                        const isAgendaActive = activePage === '/agenda' || activePage === '/mis-conferencias';
                        return (
                            <li key={link.name} className={styles.dropdownItem} ref={dropdownRef}>
                                <button
                                    className={`${styles.link} ${isAgendaActive ? styles.active : ''}`}
                                    onClick={() => setAgendaDropdownOpen((o) => !o)}
                                >
                                    {link.name}
                                    <FiChevronDown
                                        className={`${styles.chevron} ${agendaDropdownOpen ? styles.chevronOpen : ''}`}
                                        size={13}
                                    />
                                    {isAgendaActive && <span className={styles.activeDot} />}
                                </button>

                                {agendaDropdownOpen && (
                                    <ul className={styles.dropdown}>
                                        <li>
                                            <Link
                                                to="/agenda"
                                                className={`${styles.dropdownLink} ${activePage === '/agenda' ? styles.dropdownLinkActive : ''}`}
                                                onClick={closeMenu}
                                            >
                                                Agenda
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                to="/mis-conferencias"
                                                className={`${styles.dropdownLink} ${activePage === '/mis-conferencias' ? styles.dropdownLinkActive : ''}`}
                                                onClick={closeMenu}
                                            >
                                                <FiBookmark size={13} />
                                                Mis Conferencias
                                                {registeredCount > 0 && (
                                                    <span className={styles.badge}>{registeredCount}</span>
                                                )}
                                            </Link>
                                        </li>
                                    </ul>
                                )}
                            </li>
                        );
                    }

                    return (
                        <li key={link.name}>
                            <Link
                                to={link.path}
                                className={`${styles.link} ${activePage === link.path ? styles.active : ''}`}
                                onClick={closeMenu}
                            >
                                {link.name}
                                {activePage === link.path && <span className={styles.activeDot} />}
                            </Link>
                        </li>
                    );
                })}
            </ul>

            {/* ── Buscador + Autenticación ── */}
            <div className={styles.rightControls}>

                <div className={styles.searchWrapper}>
                    <FiSearch className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Buscar en CONIITI..."
                        className={styles.searchInput}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Boton de Login*/}
                <div className={styles.authWrapper}>
                    {user.isLoggedIn ? (
                        <div className={styles.userProfile}>
                            <span className={styles.userName}>{user.data?.name}</span>
                            <button className={styles.logoutBtn} onClick={() => { logout(); navigate('/'); }}>
                                Cerrar Sesión
                            </button>
                        </div>
                    ) : (
                        <button
                            className={styles.loginBtn}
                            onClick={() => navigate('/login')}
                        >
                            Iniciar Sesión
                        </button>
                    )}
                </div>

            </div>


            {/* ── Hamburguesa (móvil) ── */}
            <button
                className={`${styles.hamburger} ${menuOpen ? styles.hamburgerOpen : ''}`}
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Menú"
            >
                {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
        </nav>
    );
}
