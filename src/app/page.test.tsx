import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from './page';

describe('Home', () => {
  it('renders the icon generator page', () => {
    render(<Home />);

    expect(screen.getByText('MVP icon generator')).toBeInTheDocument();
    expect(screen.getByText('Customization')).toBeInTheDocument();
    expect(screen.getByText('Manifest.json')).toBeInTheDocument();
  });
});
