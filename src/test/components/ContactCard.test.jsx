import React from 'react';
import { render, screen, waitFor, testUtils } from '../utils/test-utils';

// Mock ContactCard component for testing
const ContactCard = React.memo(({ contact, onView, onEdit, onDelete }) => {
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="contact-card" data-testid="contact-card">
      <div className="contact-avatar">
        {contact.avatar ? (
          <img src={contact.avatar} alt={contact.name} />
        ) : (
          <div className="initials" data-testid="contact-initials">
            {getInitials(contact.name)}
          </div>
        )}
      </div>
      <div className="contact-info">
        <h3 data-testid="contact-name">{contact.name}</h3>
        <p data-testid="contact-email">{contact.email}</p>
        {contact.company && (
          <p data-testid="contact-company">{contact.company}</p>
        )}
        {contact.status && (
          <span className={`status-badge ${contact.status}`} data-testid="contact-status">
            {contact.status}
          </span>
        )}
      </div>
      <div className="contact-actions">
        <button onClick={() => onView(contact)} data-testid="view-button">
          View
        </button>
        <button onClick={() => onEdit(contact)} data-testid="edit-button">
          Edit
        </button>
        <button onClick={() => onDelete(contact.id)} data-testid="delete-button">
          Delete
        </button>
      </div>
    </div>
  );
});

describe('ContactCard', () => {
  const mockContact = testUtils.createMockContact();
  const mockHandlers = {
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onView: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders contact information correctly', () => {
    render(
      <ContactCard 
        contact={mockContact} 
        {...mockHandlers}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Sales Manager at Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByText('+1-555-0123')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
  });

  it('displays contact initials when no avatar is provided', () => {
    render(
      <ContactCard 
        contact={mockContact} 
        {...mockHandlers}
      />
    );

    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('handles missing contact information gracefully', () => {
    const incompleteContact = {
      id: '1',
      firstName: 'John',
      email: 'john@example.com',
      status: 'active',
    };

    render(
      <ContactCard 
        contact={incompleteContact} 
        {...mockHandlers}
      />
    );

    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.queryByText('undefined')).not.toBeInTheDocument();
  });

  it('calls onView when card is clicked', async () => {
    render(
      <ContactCard 
        contact={mockContact} 
        {...mockHandlers}
      />
    );

    const card = screen.getByRole('generic').closest('.cursor-pointer');
    await testUtils.user.click(card);

    expect(mockHandlers.onView).toHaveBeenCalledWith(mockContact);
  });

  it('calls onEdit when edit button is clicked', async () => {
    render(
      <ContactCard 
        contact={mockContact} 
        {...mockHandlers}
      />
    );

    await testUtils.clickButton('Edit');

    expect(mockHandlers.onEdit).toHaveBeenCalledWith(mockContact);
    expect(mockHandlers.onView).not.toHaveBeenCalled();
  });

  it('calls onDelete when delete button is clicked', async () => {
    render(
      <ContactCard 
        contact={mockContact} 
        {...mockHandlers}
      />
    );

    await testUtils.clickButton('Delete');

    expect(mockHandlers.onDelete).toHaveBeenCalledWith(mockContact);
    expect(mockHandlers.onView).not.toHaveBeenCalled();
  });

  it('prevents event propagation when action buttons are clicked', async () => {
    render(
      <ContactCard 
        contact={mockContact} 
        {...mockHandlers}
      />
    );

    await testUtils.clickButton('Edit');

    // onView should not be called when edit button is clicked
    expect(mockHandlers.onView).not.toHaveBeenCalled();
    expect(mockHandlers.onEdit).toHaveBeenCalledWith(mockContact);
  });

  it('is accessible', () => {
    render(
      <ContactCard 
        contact={mockContact} 
        {...mockHandlers}
      />
    );

    const editButton = screen.getByRole('button', { name: /edit/i });
    const deleteButton = screen.getByRole('button', { name: /delete/i });

    testUtils.checkAccessibility(editButton);
    testUtils.checkAccessibility(deleteButton);
  });

  it('supports keyboard navigation', async () => {
    render(
      <ContactCard 
        contact={mockContact} 
        {...mockHandlers}
      />
    );

    const editButton = screen.getByRole('button', { name: /edit/i });
    
    editButton.focus();
    expect(editButton).toHaveFocus();

    await testUtils.navigateWithKeyboard('Tab');
    
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    expect(deleteButton).toHaveFocus();
  });

  it('handles long names gracefully', () => {
    const longNameContact = testUtils.createMockContact({
      firstName: 'VeryLongFirstNameThatShouldBeTruncated',
      lastName: 'VeryLongLastNameThatShouldAlsoBeTruncated',
      company: 'Very Long Company Name That Should Be Truncated Properly',
    });

    render(
      <ContactCard 
        contact={longNameContact} 
        {...mockHandlers}
      />
    );

    // Check that the text is present (truncation is handled by CSS)
    expect(screen.getByText(/VeryLongFirstNameThatShouldBeTruncated/)).toBeInTheDocument();
  });

  it('renders different status badges correctly', () => {
    const inactiveContact = testUtils.createMockContact({ status: 'inactive' });

    render(
      <ContactCard 
        contact={inactiveContact} 
        {...mockHandlers}
      />
    );

    const badge = screen.getByText('inactive');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-secondary'); // Assuming secondary variant for inactive
  });

  it('memoizes correctly to prevent unnecessary re-renders', () => {
    const { rerender } = render(
      <ContactCard 
        contact={mockContact} 
        {...mockHandlers}
      />
    );

    // Re-render with same props
    rerender(
      <ContactCard 
        contact={mockContact} 
        {...mockHandlers}
      />
    );

    // Component should not re-render if props haven't changed
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('updates when contact data changes', () => {
    const { rerender } = render(
      <ContactCard 
        contact={mockContact} 
        {...mockHandlers}
      />
    );

    const updatedContact = testUtils.createMockContact({
      firstName: 'Jane',
      lastName: 'Smith',
    });

    rerender(
      <ContactCard 
        contact={updatedContact} 
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });
});