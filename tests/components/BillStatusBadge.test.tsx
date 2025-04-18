import React from 'react';
import { render, screen } from '@testing-library/react';
import { BillStatusBadge, BillActivityBadge } from '@/components/ui/bill-status-badge';
import { vi, describe, it, expect } from 'vitest';

// Mock the useTranslations hook
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    if (key === 'newActivity') return 'New Activity';
    // For billStatus namespace, return the common values
    return {
      '1': 'Introduced',
      '2': 'In Committee',
      '3': 'Passed Committee',
      '4': 'Passed First Chamber',
      '5': 'Passed Second Chamber',
      '6': 'Sent to Executive',
      '7': 'Vetoed',
      '8': 'Enacted',
      '9': 'Dead',
      '10': 'Enrolled',
      '11': 'Withdrawn',
      'unknown': 'Unknown'
    }[key] || key;
  }
}));

describe('BillStatusBadge', () => {
  it('renders with the correct status label', () => {
    render(<BillStatusBadge statusId={1} />);
    expect(screen.getByText('Introduced')).toBeInTheDocument();
  });

  it('renders with the correct styles based on status', () => {
    render(<BillStatusBadge statusId={8} />);
    const badge = screen.getByText('Enacted');
    expect(badge).toHaveClass('bg-green-600');
  });

  it('supports different sizes', () => {
    render(<BillStatusBadge statusId={1} size="sm" />);
    expect(screen.getByText('Introduced')).toHaveClass('text-xs');
  });

  it('supports outline variant', () => {
    render(<BillStatusBadge statusId={1} variant="outline" />);
    const badge = screen.getByText('Introduced');
    expect(badge).not.toHaveClass('bg-blue-600');
    expect(badge).toHaveClass('border');
  });

  it('can hide the label', () => {
    render(<BillStatusBadge statusId={1} showLabel={false} />);
    expect(screen.queryByText('Introduced')).not.toBeInTheDocument();
  });
});

describe('BillActivityBadge', () => {
  beforeAll(() => {
    // Mock Date.now() to return a fixed date
    vi.spyOn(Date, 'now').mockImplementation(() => new Date('2024-04-18').getTime());
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it('renders when date is recent', () => {
    render(<BillActivityBadge date="2024-04-17" />);
    expect(screen.getByText('New Activity')).toBeInTheDocument();
  });

  it('does not render when date is too old', () => {
    render(<BillActivityBadge date="2024-04-01" />);
    expect(screen.queryByText('New Activity')).not.toBeInTheDocument();
  });

  it('does not render when date is undefined', () => {
    render(<BillActivityBadge />);
    expect(screen.queryByText('New Activity')).not.toBeInTheDocument();
  });

  it('applies custom days window', () => {
    // This date is 20 days old
    render(<BillActivityBadge date="2024-03-29" days={21} />);
    expect(screen.getByText('New Activity')).toBeInTheDocument();
  });
});