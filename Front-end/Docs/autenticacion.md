# Autenticación y Rutas Protegidas

## Funcionamiento actual (Mock)

La autenticación es **simulada** en el front-end hasta que se integre el backend FastAPI. No hay tokens JWT reales ni comunicación con el servidor.

### Flujo de Login

```
Usuario ingresa email + contraseña
         │
         ▼
¿email === 'admin@coniiti.edu.co'?
    │ Sí                      │ No
    ▼                         ▼
login('staff')           login('normal')
navigate('/staff')       navigate('/')
```

### Flujo de Logout

```
Usuario hace clic en "Cerrar Sesión"
         │
         ▼
     logout()          ← limpia AuthContext
         │
         ▼
   navigate('/')
```

### Flujo de Registro

```
Usuario llena el formulario de registro
         │
         ▼
¿Contraseñas coinciden y ≥ 6 chars?
    │ No                      │ Sí
    ▼                         ▼
Muestra error            alert() (mock)
                         navigate('/login')
```

---

## `ProtectedRoute`

Componente que actúa como guard de ruta.

```jsx
// src/components/ProtectedRoute.jsx
import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function ProtectedRoute({ children, role }) {
    const { user } = useContext(AuthContext);
    if (!user.isLoggedIn || user.role !== role) {
        return <Navigate to="/login" replace />;
    }
    return children;
}
```

**Uso en App.jsx:**
```jsx
<Route
  path="/staff"
  element={
    <ProtectedRoute role="staff">
      <StaffDashboard />
    </ProtectedRoute>
  }
/>
```

---

## Estructura de `App.jsx` (Layout Condicional)

`App.jsx` usa `useLocation` para detectar si la ruta actual es `/staff`. Esto permite que el Panel de Staff ocupe el **100% del ancho** de la pantalla sin el `max-width` del contenedor principal.

```jsx
// Dentro de AppLayout (componente interno de App.jsx)
const isStaff = location.pathname === '/staff';

// Para /staff → sin max-width
<div className={styles.staffWrapper}>
  <Routes> ... </Routes>
</div>

// Para otras rutas → contenedor centrado con max-width
<main className={styles.main}>
  <Routes> ... </Routes>
</main>
```

---

## Roles del Sistema

| Rol | Valor | Acceso |
|---|---|---|
| Staff | `'staff'` | Agenda, Mis Conferencias, Panel de Staff |
| Normal | `'normal'` | Agenda, Mis Conferencias |
| Sin sesión | `null` | Agenda (solo lectura), Login, Registro |

---

## Pendiente para Integración con Backend

1. Reemplazar el `login()` mock por una llamada `POST /auth/login`
2. Almacenar el **JWT token** en `AuthContext` y en `localStorage`
3. Enviar el token en el header `Authorization: Bearer <token>` en cada request
4. Implementar refresh de token cuando expire
5. El `logout()` debe llamar `POST /auth/logout` y limpiar el token
