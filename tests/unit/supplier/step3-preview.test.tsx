import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Step3Preview } from '../../../src/supplier/components/create-invoice-wizard/views/Step3Preview';

describe('supplier create invoice preview', () => {
  it('shows the early payment eligibility badge with a light green background', () => {
    render(<Step3Preview onBack={vi.fn()} onSubmit={vi.fn()} />);

    const badge = screen.getByText(/early payment eligible/i).closest('div');

    expect(badge).toHaveClass('bg-secondary-fixed');
    expect(badge).toHaveClass('border-secondary-container');
  });
});
