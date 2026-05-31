import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import Agenda from '../../pages/Agenda';

vi.mock('../../hooks/useAgenda', () => ({
  useAgenda: () => ({
    searchQuery: '',
    setSearchQuery: vi.fn(),
    activeEventType: null,
    setActiveEventType: vi.fn(),
    activeRoom: null,
    setActiveRoom: vi.fn(),
    sessions: [
      {
        id: 'session-1',
        titulo: 'Arquitectura distribuida local',
      },
    ],
    days: [{ value: '2026-10-01', label: 'Dia 1' }],
    activeDay: '2026-10-01',
    activeModality: null,
    isLoading: false,
    setActiveDay: vi.fn(),
    setActiveModality: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock('../../hooks/usePolling', () => ({
  usePolling: vi.fn(),
}));

vi.mock('../../components/LiveFilter', () => ({
  default: () => <div>Filtros de agenda</div>,
}));

vi.mock('../../components/AgendaGrid', () => ({
  default: ({ sessions, isLoading }) => (
    <div>
      {isLoading ? 'Cargando agenda' : sessions.map((session) => (
        <article key={session.id}>{session.titulo}</article>
      ))}
    </div>
  ),
}));

describe('Pagina de agenda', () => {
  it('renderiza sesiones cargadas desde el hook de agenda', () => {
    render(<Agenda />);

    expect(screen.getByText(/filtros de agenda/i)).toBeInTheDocument();
    expect(screen.getByText(/arquitectura distribuida local/i)).toBeInTheDocument();
  });
});
