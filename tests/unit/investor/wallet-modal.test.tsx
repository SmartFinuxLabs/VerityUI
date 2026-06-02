import { act } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import WalletModal from '../../../src/investor/components/WalletModal';

describe('investor WalletModal component functions', () => {
  it('does not render wallet controls when closed', () => {
    render(<WalletModal isOpen={false} onClose={vi.fn()} onConnect={vi.fn()} />);

    expect(screen.queryByText(/Connect Web3 Wallet/i)).not.toBeInTheDocument();
  });

  it('connects Arc Vault on the Arc network and closes the modal', async () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    const onConnect = vi.fn();

    render(<WalletModal isOpen onClose={onClose} onConnect={onConnect} />);

    fireEvent.click(screen.getByRole('button', { name: /Arc Vault/i }));

    expect(screen.getByText(/Connecting to Arc Vault/i)).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1200);
    });

    expect(onConnect).toHaveBeenCalledWith(expect.stringMatching(/^0x[0-9a-f]{4}\.\.\.[0-9a-f]{4}$/), 'arc');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes without connecting when the close button is selected', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onConnect = vi.fn();

    render(<WalletModal isOpen onClose={onClose} onConnect={onConnect} />);

    await user.click(screen.getByRole('button', { name: /Close modal/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onConnect).not.toHaveBeenCalled();
  });
});
