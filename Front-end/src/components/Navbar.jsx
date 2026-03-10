import { useState, useRef, useEffect, useContext } from 'react';
import { FiSearch, FiMenu, FiX, FiChevronDown, FiBookmark } from 'react-icons/fi';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/coniiti_logo.png';
import styles from '../styles/components/Navbar.module.css';

import { AuthContext } from '../context/AuthContext';

const LINKS = [
    { name: 'Inicio', path: '/' },
    { 
        name: 'Agenda', 
        path: '/agenda',
        dropdown: [
            { name: 'Agenda', path: '/agenda' },
            { name: 'Mis Conferencias', path: '/mis-conferencias', icon: 'FiBookmark' }
        ]
    },
    { 
        name: 'Páginas', 
        path: '#',
        dropdown: [
            { name: 'Cómite', path: '/comite' },
            { name: 'Conferencista', path: '/conferencistas' },
            { name: 'Autores', path: '/autores' },
            { name: 'Galeria', path: '/galerias' }
        ]
    },
    { name: 'Memorias', path: '/memorias' },
    { name: 'Acerca De', path: '/acerca-de' },
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
    const [openDropdown, setOpenDropdown] = useState(null);
    const navbarRef = useRef(null);

    // Cierra el dropdown al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (navbarRef.current && !navbarRef.current.contains(e.target)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const closeMenu = () => {
        setMenuOpen(false);
        setOpenDropdown(null);
    };

    return (
        <nav className={styles.navbar} ref={navbarRef}>
            {/* ── Logo + Nombre ── */}
            <Link to="/" className={styles.brand} onClick={closeMenu}>
                <img src={logo} alt="Logo CONIITI" className={styles.logoImg} />
                <div className={styles.brandText}>
                    <span className={styles.brandName}>
                        <span className={styles.accent}>C</span>ONIITI
                    </span>
                    <span className={styles.brandEdition}>XI Edición · 2026 v1</span>
                </div>
            </Link>

            {/* ── Links de navegación ── */}
            <ul className={`${styles.links} ${menuOpen ? styles.linksOpen : ''}`}>
                {LINKS.map((link) => {
                    if (link.dropdown) {
                        const isActive = activePage === link.path || link.dropdown.some(sub => activePage === sub.path);
                        const isOpen = openDropdown === link.name;
                        
                        return (
                            <li key={link.name} className={styles.dropdownItem}>
                                <button
                                    className={`${styles.link} ${isActive ? styles.active : ''}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setOpenDropdown(isOpen ? null : link.name);
                                    }}
                                >
                                    {link.name}
                                    <FiChevronDown
                                        className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
                                        size={13}
                                    />
                                    {isActive && <span className={styles.activeDot} />}
                                </button>

                                {isOpen && (
                                    <ul className={styles.dropdown}>
                                        {link.dropdown.map(subLink => (
                                            <li key={subLink.name}>
                                                <Link
                                                    to={subLink.path}
                                                    className={`${styles.dropdownLink} ${activePage === subLink.path ? styles.dropdownLinkActive : ''}`}
                                                    onClick={closeMenu}
                                                >
                                                    {subLink.icon === 'FiBookmark' && <FiBookmark size={13} />}
                                                    {subLink.name}
                                                    {user && subLink.icon === 'FiBookmark' && registeredCount > 0 && (
                                                        <span className={styles.badge}>{registeredCount}</span>
                                                    )}
                                                </Link>
                                            </li>
                                        ))}
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

                {/* Sección de Autenticación */}
                <div className={styles.authWrapper}>
                    {user ? (
                        <div className={styles.userProfile}>
                            {user.role === 'superuser' && (
                                <>
                                    <Link to="/superusuario" className={styles.staffLink} onClick={closeMenu}>
                                        Panel Admin
                                    </Link>
                                    <Link to="/staff" className={styles.staffLink} onClick={closeMenu}>
                                        Panel Staff
                                    </Link>
                                </>
                            )}
                            {user.role === 'staff' && (
                                <Link to="/staff" className={styles.staffLink} onClick={closeMenu}>
                                    Panel Staff
                                </Link>
                            )}
                            <span className={styles.userName}>{user.full_name}</span>
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
