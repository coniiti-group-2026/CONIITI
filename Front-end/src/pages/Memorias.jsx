import React from 'react';
import DynamicPage from './DynamicPage';

export default function Memorias() {
    return (
        <DynamicPage 
            title="Memorias del Congreso" 
            description="Descarga y revisa las ponencias, certificados y documentación entregada a lo largo del congreso." 
            section="memorias" 
        />
    );
}
