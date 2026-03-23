// ============================================================
// Modal de Formulario Staff — CONIITI Front-end
// Permite al superusuario crear o editar una cuenta staff.
// Separado del SuperuserDashboard siguiendo el principio SRP.
// ============================================================

import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import styles from '../styles/components/StaffFormModal.module.css';

/**
 * StaffFormModal — modal reutilizable para crear o editar cuentas staff.
 *
 * @param {{ staffMember?: object, onSave: Function, onClose: Function }} props
 */
export default function StaffFormModal({ staffMember, onSave, onClose }) {
    const isEditing = Boolean(staffMember);

    const [form, setForm] = useState({
        full_name: '',
        email: '',
        institution: '',
        password: '',
    });

    // Precarga los datos si está editando
    useEffect(() => {
        if (staffMember) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setForm({
                full_name: staffMember.full_name ?? '',
                email: staffMember.email ?? '',
                institution: staffMember.institution ?? '',
                password: '',
            });
        }
    }, [staffMember]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = { ...form };
        // Al editar, omite la contraseña si está vacía
        if (isEditing && !data.password) {
            delete data.password;
        }
        onSave(data);
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                {/* Encabezado */}
                <div className={styles.header}>
                    <h2 className={styles.title}>
                        {isEditing ? 'Editar cuenta staff' : 'Nueva cuenta staff'}
                    </h2>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar modal">
                        <FiX size={20} />
                    </button>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="staff-name">Nombre completo *</label>
                        <input
                            type="text"
                            id="staff-name"
                            name="full_name"
                            value={form.full_name}
                            onChange={handleChange}
                            placeholder="Nombre y apellido"
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="staff-email">Correo electrónico *</label>
                        <input
                            type="email"
                            id="staff-email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="correo@ejemplo.com"
                            required
                            disabled={isEditing}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="staff-institution">Institución / Área</label>
                        <input
                            type="text"
                            id="staff-institution"
                            name="institution"
                            value={form.institution}
                            onChange={handleChange}
                            placeholder="Ej: Coordinación académica"
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="staff-password">
                            {isEditing ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña * (mín. 8)'}
                        </label>
                        <input
                            type="password"
                            id="staff-password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder={isEditing ? 'Opcional' : 'Mínimo 8 caracteres'}
                            minLength={isEditing ? undefined : 8}
                            required={!isEditing}
                            autoComplete="new-password"
                        />
                    </div>

                    <div className={styles.actions}>
                        <button type="button" className={styles.cancelBtn} onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" className={styles.saveBtn}>
                            {isEditing ? 'Guardar cambios' : 'Crear cuenta'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
