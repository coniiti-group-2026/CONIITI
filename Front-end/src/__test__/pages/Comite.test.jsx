import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import { fetchCommitteeMembers } from '../../services/committeeService';
import Comite from '../../pages/Comite';

vi.mock('../../services/committeeService', () => ({
  fetchCommitteeMembers: vi.fn(),
  getCommitteeFallback: vi.fn(() => []),
}));

vi.mock('../../components/PersonCard', () => ({
  default: ({ person }) => (
    <article>
      <h2>{person.title}</h2>
      <p>{person.subtitle}</p>
    </article>
  ),
}));

describe('Pagina de comite', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('consume la API de comites y muestra miembros activos', async () => {
    fetchCommitteeMembers.mockResolvedValue([
      {
        id: 1,
        title: 'Dra. Ada Lovelace',
        subtitle: 'Comite cientifico | Universidad CONIITI',
      },
    ]);

    render(<Comite />);

    await waitFor(() => {
      expect(screen.getByText(/dra. ada lovelace/i)).toBeInTheDocument();
    });

    expect(fetchCommitteeMembers).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/universidad coniiti/i)).toBeInTheDocument();
  });
});
