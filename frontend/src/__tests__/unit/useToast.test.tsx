import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ToastProvider, useToast } from '../../components/useToast';

const TestComponent = () => {
  const toast = useToast();
  return (
    <div>
      <button onClick={() => toast.show('Test Success Message', 'success')}>
        Trigger Success Toast
      </button>
      <button onClick={() => toast.show('Test Error Message', 'error')}>
        Trigger Error Toast
      </button>
    </div>
  );
};

describe('ToastProvider & useToast', () => {
  it('renders children correctly', () => {
    render(
      <ToastProvider>
        <div>Child Element</div>
      </ToastProvider>
    );

    expect(screen.getByText('Child Element')).toBeInTheDocument();
  });

  it('displays toast message when triggered and auto dismisses', () => {
    vi.useFakeTimers();

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const button = screen.getByText('Trigger Success Toast');
    
    act(() => {
      fireEvent.click(button);
    });

    expect(screen.getByText('Test Success Message')).toBeInTheDocument();

    // Fast forward timer to auto-dismiss toast
    act(() => {
      vi.advanceTimersByTime(3500);
    });

    expect(screen.queryByText('Test Success Message')).not.toBeInTheDocument();

    vi.useRealTimers();
  });
});
