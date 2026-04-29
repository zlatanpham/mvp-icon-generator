import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from './page';

// next/font is not available in vitest jsdom — stub it.
vi.mock('next/font/google', () => {
  const fake = () => ({
    className: '',
    style: { fontFamily: 'sans-serif' },
    variable: '--font-mock',
  });
  return { Inter: fake, Fraunces: fake, JetBrains_Mono: fake };
});

describe('Home', () => {
  it('renders the studio shell', () => {
    render(<Home />);
    expect(screen.getByText('Atelier')).toBeInTheDocument();
    // Properties heading split across nodes — match by role.
    expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
  });
});
