import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AppointmentPreviewCard from '../../components/lawyerDashboard/AppointmentPreviewCard';

describe('AppointmentPreviewCard', () => {
  const mockAppointment = {
    _id: 'apt-123',
    appointmentTime: '2026-08-15T10:30:00.000Z',
    userId: {
      name: 'John Doe',
      email: 'john@example.com',
      profileImageUrl: 'https://example.com/avatar.jpg',
    },
  };

  it('renders user details correctly', () => {
    render(<AppointmentPreviewCard appointment={mockAppointment} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('renders fallback user name when userId is missing', () => {
    const incompleteAppointment = {
      _id: 'apt-456',
      appointmentTime: '2026-08-15T10:30:00.000Z',
    };

    render(<AppointmentPreviewCard appointment={incompleteAppointment} />);

    expect(screen.getByText('User')).toBeInTheDocument();
  });
});
