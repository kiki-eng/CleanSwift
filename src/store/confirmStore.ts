import { create } from 'zustand';

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Red/destructive styling for the confirm button — cancelling, deleting, etc. */
  destructive?: boolean;
}

interface ConfirmState {
  visible: boolean;
  options: ConfirmOptions | null;
  resolve: ((value: boolean) => void) | null;
}

/**
 * Backs a single app-wide confirm dialog (mounted once via
 * <ConfirmDialogHost /> at the app root) so any screen can await a
 * themed yes/no confirmation without wiring local modal state.
 */
export const useConfirmStore = create<ConfirmState>()(() => ({
  visible: false,
  options: null,
  resolve: null,
}));

/** Show the confirm dialog and resolve true/false when the user answers. */
export function confirmAction(options: ConfirmOptions): Promise<boolean> {
  return new Promise(resolve => {
    // If a confirmation is already open, resolve it "cancelled" before
    // replacing it — callers should never be left with a dangling promise.
    const pending = useConfirmStore.getState().resolve;
    pending?.(false);
    useConfirmStore.setState({ visible: true, options, resolve });
  });
}

export function resolveConfirm(value: boolean): void {
  const { resolve } = useConfirmStore.getState();
  useConfirmStore.setState({ visible: false, options: null, resolve: null });
  resolve?.(value);
}
