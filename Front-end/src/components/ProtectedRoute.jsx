// ============================================================
// Componente ProtectedRoute — CONIITI Front-end
// Protege rutas según el estado de autenticación y roles.
// Soporta uno o varios roles permitidos mediante un array.
// Muestra un loader mientras se verifica la sesión.
// ============================================================

import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import styles from '../styles/components/ProtectedRoute.module.css';

/**
 * ProtectedRoute — envuelve rutas que requieren autenticación y/o un rol específico.
 *
 * @param {{ children: React.ReactNode, roles?: string[] }} props
 *   - roles: array de roles permitidos (ej: ['staff', 'superuser']).
 *            Si se omite, solo requiere que el usuario esté autenticado.
 */
export default function ProtectedRoute({ children, roles }) {
    const { user, isLoading } = useContext(AuthContext);

    // Muestra indicador de carga mientras se verifica la sesión
    if (isLoading) {
        return (
            <div className={styles.loader}>
                <span className={styles.spinner} />
            </div>
        );
    }

    // Redirige al login si no hay sesión activa
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Redirige al inicio si el rol del usuario no está en la lista permitida
    if (roles && !roles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return children;
}
