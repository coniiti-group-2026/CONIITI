import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import Estado from '../../pages/Estado';


describe('Pagina de estado', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('muestra disponibilidad de servicios consultando healthchecks', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ status: 'ok' }),
    })));

    render(<Estado />);

    await waitFor(() => {
      expect(screen.getByText(/servicios disponibles/i)).toBeInTheDocument();
    });

    expect(screen.getByText('Auth')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });
});
