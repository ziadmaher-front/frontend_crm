import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Simple ContactCard component for testing
const ContactCard = ({ contact, onView, onEdit, onDelete }) => {
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div data-testid="contact-card" className="contact-card">
      <div className="contact-avatar">
        {contact.avatar ? (
          <img src={contact.avatar} alt={contact.name} />
        ) : (
          <span data-testid="contact-initials">{getInitials(contact.name)}</span>
        )}
      </div>
      <div className="contact-info">
        <h3 data-testid="contact-name">{contact.name}</h3>
        <p data-testid="contact-email">{contact.email}</p>
        <p data-testid="contact-phone">{contact.phone}</p>
        {contact.company && (
          <p data-testid="contact-company">{contact.company}</p>
        )}
      </div>
      <div className="contact-actions">
        <button 
          data-testid="view-button"
          onClick={(e) => {
            e.stopPropagation();
            onView?.(contact.id);
          }}
        >
          View
        </button>
        <button 
          data-testid="edit-button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.(contact.id);
          }}
        >
          Edit
        </button>
        <button 
          data-testid="delete-button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(contact.id);
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

// Test wrapper
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('ContactCard', () => {
  const mockContact = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    company: 'Acme Corp',
  };

  const mockHandlers = {
    onView: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders contact information correctly', () => {
    render(
      <TestWrapper>
        <ContactCard contact={mockContact} {...mockHandlers} />
      </TestWrapper>
    );

    expect(screen.getByTestId('contact-name')).toHaveTextContent('John Doe');
    expect(screen.getByTestId('contact-email')).toHaveTextContent('john@example.com');
    expect(screen.getByTestId('contact-phone')).toHaveTextContent('+1234567890');
    expect(screen.getByTestId('contact-company')).toHaveTextContent('Acme Corp');
  });

  it('displays initials when no avatar is provided', () => {
    render(
      <TestWrapper>
        <ContactCard contact={mockContact} {...mockHandlers} />
      </TestWrapper>
    );

    expect(screen.getByTestId('contact-initials')).toHaveTextContent('JD');
  });

  it('calls onView when view button is clicked', () => {
    render(
      <TestWrapper>
        <ContactCard contact={mockContact} {...mockHandlers} />
      </TestWrapper>
    );

    fireEvent.click(screen.getByTestId('view-button'));
    expect(mockHandlers.onView).toHaveBeenCalledWith('1');
  });

  it('calls onEdit when edit button is clicked', () => {
    render(
      <TestWrapper>
        <ContactCard contact={mockContact} {...mockHandlers} />
      </TestWrapper>
    );

    fireEvent.click(screen.getByTestId('edit-button'));
    expect(mockHandlers.onEdit).toHaveBeenCalledWith('1');
  });

  it('calls onDelete when delete button is clicked', () => {
    render(
      <TestWrapper>
        <ContactCard contact={mockContact} {...mockHandlers} />
      </TestWrapper>
    );

    fireEvent.click(screen.getByTestId('delete-button'));
    expect(mockHandlers.onDelete).toHaveBeenCalledWith('1');
  });

  it('handles missing company gracefully', () => {
    const contactWithoutCompany = { ...mockContact };
    delete contactWithoutCompany.company;

    render(
      <TestWrapper>
        <ContactCard contact={contactWithoutCompany} {...mockHandlers} />
      </TestWrapper>
    );

    expect(screen.queryByTestId('contact-company')).not.toBeInTheDocument();
  });

  it('handles long names correctly', () => {
    const contactWithLongName = {
      ...mockContact,
      name: 'John Michael Christopher Doe',
    };

    render(
      <TestWrapper>
        <ContactCard contact={contactWithLongName} {...mockHandlers} />
      </TestWrapper>
    );

    expect(screen.getByTestId('contact-initials')).toHaveTextContent('JM');
  });
});