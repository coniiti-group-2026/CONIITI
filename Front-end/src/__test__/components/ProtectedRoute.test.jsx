import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import '@testing-library/jest-dom';

import { AuthContext } from '../../context/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';


function renderProtectedRoute({ user = null, isLoading = false } = {}) {
  render(
    <AuthContext.Provider value={{ user, isLoading }}>
      <MemoryRouter initialEntries={['/staff']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route
            path="/staff"
            element={(
              <ProtectedRoute roles={['staff', 'superuser']}>
                <div>Staff Panel</div>
              </ProtectedRoute>
            )}
          />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}


describe('ProtectedRoute', () => {
  it('redirige al login cuando no hay usuario autenticado', () => {
    renderProtectedRoute();

    expect(screen.getByText(/login page/i)).toBeInTheDocument();
  });

  it('renderiza la ruta protegida cuando el rol esta autorizado', () => {
    renderProtectedRoute({
      user: {
        id: 'user-1',
        role: 'staff',
      },
    });

    expect(screen.getByText(/staff panel/i)).toBeInTheDocument();
  });
});
