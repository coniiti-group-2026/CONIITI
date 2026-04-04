// ============================================================
// Panel del Superusuario — CONIITI Front-end
// Muestra dos secciones mediante tabs:
//  1. Gestión de Conferencias (reutiliza StaffDashboard)
//  2. Gestión de Cuentas Staff (CRUD propio del superusuario)
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiUser, FiCheckCircle, FiXCircle, FiCalendar, FiUsers } from 'react-icons/fi';
import { listStaff, createStaff, updateStaff, deleteStaff } from '../services/userService';
import StaffFormModal from '../components/StaffFormModal';
import StaffDashboard from './StaffDashboard';
import styles from '../styles/pages/SuperuserDashboard.module.css';

export default function SuperuserDashboard() {
    const [activeTab, setActiveTab] = useState('conferencias');

    return (
        <div>
            {/* Tabs de navegación */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'conferencias' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('conferencias')}
                >
                    <FiCalendar style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />
                    Conferencias
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'staff' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('staff')}
                >
                    <FiUsers style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />
                    Gestión de Staff
                </button>
            </div>

            {/* Contenido según tab activo */}
            {activeTab === 'conferencias' && <StaffDashboard />}
            {activeTab === 'staff'        && <StaffPanel />}
        </div>
    );
}

// ── Sub-componente: Gestión de Staff ──────────────────────────
function StaffPanel() {
    const [staffList, setStaffList]   = useState([]);
    const [isLoading, setIsLoading]   = useState(true);
    const [modalOpen, setModalOpen]   = useState(false);
    const [staffToEdit, setStaffToEdit] = useState(null);
    const [error, setError]           = useState('');

    const fetchStaff = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const data = await listStaff();
            setStaffList(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchStaff(); }, [fetchStaff]);

    const handleNew       = ()       => { setStaffToEdit(null);   setModalOpen(true); };
    const handleEdit      = (member) => { setStaffToEdit(member); setModalOpen(true); };

    const handleDelete = async (member) => {
        if (!window.confirm(`¿Eliminar la cuenta de ${member.full_name}? Esta acción no se puede deshacer.`)) return;
        try {
            await deleteStaff(member.id);
            setStaffList(prev => prev.filter(s => s.id !== member.id));
        } catch (err) { alert(`Error: ${err.message}`); }
    };

    const handleToggleActive = async (member) => {
        try {
            const updated = await updateStaff(member.id, { is_active: !member.is_active });
            setStaffList(prev => prev.map(s => s.id === updated.id ? updated : s));
        } catch (err) { alert(`Error: ${err.message}`); }
    };

    const handleSave = async (data) => {
        try {
            if (staffToEdit) {
                const updated = await updateStaff(staffToEdit.id, data);
                setStaffList(prev => prev.map(s => s.id === updated.id ? updated : s));
            } else {
                const created = await createStaff(data);
                setStaffList(prev => [created, ...prev]);
            }
            setModalOpen(false);
        } catch (err) { alert(`Error: ${err.message}`); }
    };

    return (
        <div>
            {/* Encabezado */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <h1>Gestión de Staff</h1>
                    <p>Administra las cuentas del equipo — CONIITI 2026</p>
                </div>
                <button className={styles.newBtn} onClick={handleNew}>
                    <FiPlus size={16} /> Nueva cuenta staff
                </button>
            </div>

            {error && <p className={styles.errorBanner}>{error}</p>}

            {/* Tabla */}
            <div className={styles.card}>
                {isLoading ? (
                    <div className={styles.loading}>Cargando cuentas staff...</div>
                ) : staffList.length === 0 ? (
                    <div className={styles.empty}>
                        <FiUser size={40} opacity={0.3} />
                        <p>No hay cuentas staff registradas. ¡Crea la primera!</p>
                    </div>
                ) : (
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Correo</th>
                                    <th>Institución</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {staffList.map(member => (
                                    <tr key={member.id} className={!member.is_active ? styles.rowInactive : ''}>
                                        <td><strong>{member.full_name}</strong></td>
                                        <td>{member.email}</td>
                                        <td>{member.institution ?? '—'}</td>
                                        <td>
                                            <span className={`${styles.badge} ${member.is_active ? styles.badgeActive : styles.badgeInactive}`}>
                                                {member.is_active ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className={styles.actions}>
                                                <button
                                                    className={member.is_active ? styles.deactivateBtn : styles.activateBtn}
                                                    onClick={() => handleToggleActive(member)}
                                                    title={member.is_active ? 'Desactivar' : 'Activar'}
                                                >
                                                    {member.is_active ? <FiXCircle size={13} /> : <FiCheckCircle size={13} />}
                                                    {member.is_active ? 'Desactivar' : 'Activar'}
                                                </button>
                                                <button className={styles.editBtn} onClick={() => handleEdit(member)} title="Editar">
                                                    <FiEdit2 size={13} /> Editar
                                                </button>
                                                <button className={styles.deleteBtn} onClick={() => handleDelete(member)} title="Eliminar">
                                                    <FiTrash2 size={13} /> Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <div className={styles.count}>
                    {staffList.length} {staffList.length === 1 ? 'cuenta staff' : 'cuentas staff'} en total
                </div>
            </div>

            {modalOpen && (
                <StaffFormModal
                    staffMember={staffToEdit}
                    onSave={handleSave}
                    onClose={() => setModalOpen(false)}
                />
            )}
        </div>
    );
}
