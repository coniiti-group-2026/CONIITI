import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/variables.css';
import './styles/global.css';
import './styles/animations.css';
import App from './App.jsx';

// importar el proveedor
import { AuthProvider } from './context/AuthContext.jsx';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <AuthProvider>
            <App />
        </AuthProvider>
    </StrictMode>
);
