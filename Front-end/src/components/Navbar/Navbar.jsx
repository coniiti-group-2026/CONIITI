import { useState, useRef, useEffect } from 'react';
import { FiSearch, FiMenu, FiX, FiChevronDown, FiBookmark } from 'react-icons/fi';
import logo from '../../assets/coniiti_logo.png';
import styles from './Navbar.module.css';

const LINKS = ['Inicio', 'Agenda', 'Memorias', 'Acerca de', 'Contacto'];

export default function Navbar({ onNavigate, activePage, registeredCount = 0 }) {
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

    const handleNav = (page) => {
        onNavigate(page);
        setMenuOpen(false);
        setAgendaDropdownOpen(false);
    };

    return (
        <nav className={styles.navbar}>
            {/* ── Logo + Nombre ── */}
            <button className={styles.brand} onClick={() => handleNav('Inicio')}>
                <img src={logo} alt="Logo CONIITI" className={styles.logoImg} />
                <div className={styles.brandText}>
                    <span className={styles.brandName}>
                        <span className={styles.accent}>C</span>ONIITI
                    </span>
                    <span className={styles.brandEdition}>XI Edición · 2025</span>
                </div>
            </button>

            {/* ── Links de navegación ── */}
            <ul className={`${styles.links} ${menuOpen ? styles.linksOpen : ''}`}>
                {LINKS.map((link) => {
                    // Link especial "Agenda" con dropdown
                    if (link === 'Agenda') {
                        return (
                            <li key={link} className={styles.dropdownItem} ref={dropdownRef}>
                                <button
                                    className={`${styles.link} ${(activePage === 'Agenda' || activePage === 'Mis Conferencias') ? styles.active : ''}`}
                                    onClick={() => setAgendaDropdownOpen((o) => !o)}
                                >
                                    {link}
                                    <FiChevronDown
                                        className={`${styles.chevron} ${agendaDropdownOpen ? styles.chevronOpen : ''}`}
                                        size={13}
                                    />
                                    {(activePage === 'Agenda' || activePage === 'Mis Conferencias') && (
                                        <span className={styles.activeDot} />
                                    )}
                                </button>

                                {agendaDropdownOpen && (
                                    <ul className={styles.dropdown}>
                                        <li>
                                            <button
                                                className={`${styles.dropdownLink} ${activePage === 'Agenda' ? styles.dropdownLinkActive : ''}`}
                                                onClick={() => handleNav('Agenda')}
                                            >
                                                Agenda
                                            </button>
                                        </li>
                                        <li>
                                            <button
                                                className={`${styles.dropdownLink} ${activePage === 'Mis Conferencias' ? styles.dropdownLinkActive : ''}`}
                                                onClick={() => handleNav('Mis Conferencias')}
                                            >
                                                <FiBookmark size={13} />
                                                Mis Conferencias
                                                {registeredCount > 0 && (
                                                    <span className={styles.badge}>{registeredCount}</span>
                                                )}
                                            </button>
                                        </li>
                                    </ul>
                                )}
                            </li>
                        );
                    }

                    return (
                        <li key={link}>
                            <button
                                className={`${styles.link} ${activePage === link ? styles.active : ''}`}
                                onClick={() => handleNav(link)}
                            >
                                {link}
                                {activePage === link && <span className={styles.activeDot} />}
                            </button>
                        </li>
                    );
                })}
            </ul>

            {/* ── Buscador ── */}
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
