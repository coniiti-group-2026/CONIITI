import { describe, expect, it, vi, afterEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

import { AuthContext } from '../../context/AuthContext';
import Login from '../../pages/Login';

vi.mock('@tsparticles/react', () => ({
  default: () => null,
  initParticlesEngine: vi.fn(() => Promise.resolve()),
}));

vi.mock('@tsparticles/slim', () => ({
  loadSlim: vi.fn(() => Promise.resolve()),
}));

vi.mock('../../services/authService', () => ({
  cacheOtpDebugInfo: vi.fn(),
  getGoogleLoginUrl: vi.fn(() => '#google'),
  getMe: vi.fn(() => Promise.resolve(null)),
  getMicrosoftLoginUrl: vi.fn(() => '#microsoft'),
  login: vi.fn(),
  loginWithGoogle: vi.fn(),
  loginWithMicrosoft: vi.fn(),
}));

describe('Pagina de login', () => {
  afterEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('valida el formato de correo antes de enviar credenciales', () => {
    render(
      <AuthContext.Provider value={{ user: null, setUser: vi.fn() }}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    fireEvent.change(screen.getByPlaceholderText(/tu@correo.com/i), {
      target: { value: 'correo@invalido' },
    });
    fireEvent.change(screen.getByPlaceholderText(/tu contrase/i), {
      target: { value: 'Password123' },
    });
    fireEvent.submit(screen.getByRole('button', { name: /entrar/i }).closest('form'));

    expect(screen.getByText(/correo electronico valido/i)).toBeInTheDocument();
  });
});
