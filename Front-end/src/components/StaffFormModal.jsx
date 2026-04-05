import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

import styles from '../styles/components/StaffFormModal.module.css';

export default function StaffFormModal({ staffMember, onSave, onClose }) {
    const isEditing = Boolean(staffMember);

    const [form, setForm] = useState({
        full_name: '',
        email: '',
        institution: '',
        password: '',
    });

    useEffect(() => {
        if (staffMember) {
            setForm({
                full_name: staffMember.full_name ?? '',
                email: staffMember.email ?? '',
                institution: staffMember.institution ?? '',
                password: '',
            });
        }
    }, [staffMember]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const data = { ...form };

        if (isEditing && !data.password) {
            delete data.password;
        }

        onSave(data);
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>
                        {isEditing ? 'Editar cuenta del equipo' : 'Nueva cuenta del equipo'}
                    </h2>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar ventana">
                        <FiX size={20} />
                    </button>
                </div>

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
                        <label htmlFor="staff-institution">Institución / área</label>
                        <input
                            type="text"
                            id="staff-institution"
                            name="institution"
                            value={form.institution}
                            onChange={handleChange}
                            placeholder="Ej.: Coordinación académica"
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="staff-password">
                            {isEditing ? 'Nueva contraseña (déjala vacía si no deseas cambiarla)' : 'Contraseña * (mín. 8)'}
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
