import React from 'react';
import DynamicPage from './DynamicPage';

export default function Conferencistas() {
    return (
        <DynamicPage 
            title="Oradores Principales" 
            description="Conoce a nuestros conferencistas invitados de honor de nuestro XI Congreso CONIITI." 
            section="conferencistas" 
        />
    );
}
