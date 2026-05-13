import { render, screen } from '@testing-library/react';
import { Empty } from './Empty';

describe('Empty', () => {
  it('renders "All caught up" text', () => {
    render(<Empty />);
    expect(screen.getByText('All caught up')).toBeInTheDocument();
  });

  it('renders the bell emoji', () => {
    render(<Empty />);
    expect(screen.getByText('🔔')).toBeInTheDocument();
  });

  it('marks the bell emoji as aria-hidden', () => {
    render(<Empty />);
    expect(screen.getByText('🔔')).toHaveAttribute('aria-hidden', 'true');
  });
});
