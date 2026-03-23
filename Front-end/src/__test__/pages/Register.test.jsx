import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Register from '../../pages/Register';

describe('Componente de Registro', () => {
  it('Debe renderizar correctamente el botón principal de Crear Cuenta', () => {
    
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );
    
    const botonRegistro = screen.getByRole('button', { name: /Crear Cuenta/i });
    expect(botonRegistro).toBeInTheDocument();
  });
});
