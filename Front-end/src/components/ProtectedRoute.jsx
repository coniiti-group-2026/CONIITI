import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * ProtectedRoute — Protege rutas que requieren un rol específico.
 * Si el usuario no está autenticado o no tiene el rol correcto,
 * lo redirige a /login.
 *
 * @param {{ children: React.ReactNode, role: string }} props
 */
export default function ProtectedRoute({ children, role }) {
    const { user } = useContext(AuthContext);

    if (!user.isLoggedIn || (role && user.role !== role)) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
