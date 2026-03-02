// Guardar info del usuario para identificarlo en toda la app y saber si es staff
import React, { createContext, useState } from 'react';

// Crear el contexto (la caja vacía)
export const AuthContext = createContext();

// Crear el "Provider" (el componente que repartirá la información)
export const AuthProvider = ({ children }) => {
    // Estado inicial. Por defecto, nadie ha iniciado sesión.
    const [user, setUser] = useState({
        isLoggedIn: false,
        role: null, // Más adelante será 'staff' o 'normal'
        data: null  // Se guarda el nombre, email, etc.
    });

    // Función para simular que iniciamos sesión (por ahora manual)
    const login = (roleType) => {
        setUser({
            isLoggedIn: true,
            role: roleType,
            data: { name: 'Usuario de Prueba' }
        });
    };

    // Función para cerrar sesión
    const logout = () => {
        setUser({
            isLoggedIn: false,
            role: null,
            data: null
        });
    };

    // retornan el proveedor con los datos y funciones que se quieren compartir
    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
