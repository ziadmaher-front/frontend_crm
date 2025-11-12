/**
 * Comprehensive Test Suite for Validation Utilities
 * Tests all validation functions, sanitization, and security features
 */

import {
  sanitizeInput,
  validators,
  ValidationSchema,
  commonSchemas,
  useValidation,
  sanitizeApiData,
  securityHeaders
} from '../validation';

const {
  email: validateEmail,
  phone: validatePhone,
  url: validateUrl,
  date: validateDate,
  numberRange: validateNumberRange,
  stringLength: validateStringLength,
  required: validateRequired,
  currency: validateCurrency,
  percentage: validatePercentage
} = validators;
import { renderHook, act } from '@testing-library/react';

describe('Validation Utilities', () => {
  describe('Input Sanitization', () => {
    describe('sanitizeInput.html', () => {
      test('removes script tags', () => {
        const maliciousInput = '<script>alert("xss")</script>Hello World';
        const sanitized = sanitizeInput.html(maliciousInput);
        expect(sanitized).toBe('Hello World');
        expect(sanitized).not.toContain('<script>');
      });

      test('removes dangerous attributes', () => {
        const maliciousInput = '<div onclick="alert(\'xss\')">Content</div>';
        const sanitized = sanitizeInput.html(maliciousInput);
        expect(sanitized).not.toContain('onclick');
      });

      test('preserves safe HTML tags', () => {
        const safeInput = '<p>Hello <strong>World</strong></p>';
        const sanitized = sanitizeInput.html(safeInput);
        expect(sanitized).toContain('<p>');
        expect(sanitized).toContain('<strong>');
      });

      test('handles empty input', () => {
        expect(sanitizeInput.html('')).toBe('');
        expect(sanitizeInput.html(null)).toBe('');
        expect(sanitizeInput.html(undefined)).toBe('');
      });
    });

    describe('sanitizeInput.sql', () => {
      test('escapes SQL injection attempts', () => {
        const maliciousInput = "'; DROP TABLE users; --";
        const sanitized = sanitizeInput.sql(maliciousInput);
        expect(sanitized).not.toContain('DROP TABLE');
        expect(sanitized).toContain("\\'");
      });

      test('handles normal text', () => {
        const normalInput = "John's Company";
        const sanitized = sanitizeInput.sql(normalInput);
        expect(sanitized).toContain("\\'");
      });
    });

    describe('sanitizeInput.json', () => {
      test('removes dangerous JSON properties', () => {
        const maliciousInput = '{"__proto__": {"admin": true}, "name": "John"}';
        const sanitized = sanitizeInput.json(maliciousInput);
        const parsed = JSON.parse(sanitized);
        expect(parsed).not.toHaveProperty('__proto__');
        expect(parsed.name).toBe('John');
      });

      test('handles invalid JSON gracefully', () => {
        const invalidJson = '{invalid json}';
        const sanitized = sanitizeInput.json(invalidJson);
        expect(sanitized).toBe('{}');
      });
    });

    describe('sanitizeInput.text', () => {
      test('removes control characters', () => {
        const input = 'Hello\x00\x01World';
        const sanitized = sanitizeInput.text(input);
        expect(sanitized).toBe('HelloWorld');
      });

      test('trims whitespace', () => {
        const input = '  Hello World  ';
        const sanitized = sanitizeInput.text(input);
        expect(sanitized).toBe('Hello World');
      });
    });

    describe('sanitizeInput.number', () => {
      test('extracts valid numbers', () => {
        expect(sanitizeInput.number('123.45')).toBe(123.45);
        expect(sanitizeInput.number('$1,234.56')).toBe(1234.56);
        expect(sanitizeInput.number('invalid')).toBe(0);
      });

      test('handles negative numbers', () => {
        expect(sanitizeInput.number('-123.45')).toBe(-123.45);
      });
    });

    describe('sanitizeInput.email', () => {
      test('normalizes email addresses', () => {
        expect(sanitizeInput.email('  TEST@EXAMPLE.COM  ')).toBe('test@example.com');
        expect(sanitizeInput.email('Test.User+tag@Example.Com')).toBe('test.user+tag@example.com');
      });

      test('handles invalid emails', () => {
        expect(sanitizeInput.email('invalid-email')).toBe('');
        expect(sanitizeInput.email('')).toBe('');
      });
    });
  });

  describe('Validation Functions', () => {
    describe('validateEmail', () => {
      test('validates correct email formats', () => {
        expect(validateEmail('test@example.com')).toBe(true);
        expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true);
        expect(validateEmail('user123@test-domain.com')).toBe(true);
      });

      test('rejects invalid email formats', () => {
        expect(validateEmail('invalid-email')).toBe(false);
        expect(validateEmail('test@')).toBe(false);
        expect(validateEmail('@example.com')).toBe(false);
        expect(validateEmail('test..test@example.com')).toBe(false);
      });

      test('handles edge cases', () => {
        expect(validateEmail('')).toBe(false);
        expect(validateEmail(null)).toBe(false);
        expect(validateEmail(undefined)).toBe(false);
      });
    });

    describe('validatePhone', () => {
      test('validates US phone numbers', () => {
        expect(validatePhone('+1-555-123-4567')).toBe(true);
        expect(validatePhone('(555) 123-4567')).toBe(true);
        expect(validatePhone('555.123.4567')).toBe(true);
        expect(validatePhone('5551234567')).toBe(true);
      });

      test('validates international phone numbers', () => {
        expect(validatePhone('+44 20 7946 0958')).toBe(true);
        expect(validatePhone('+33 1 42 86 83 26')).toBe(true);
      });

      test('rejects invalid phone numbers', () => {
        expect(validatePhone('123')).toBe(false);
        expect(validatePhone('abc-def-ghij')).toBe(false);
        expect(validatePhone('')).toBe(false);
      });
    });

    describe('validateURL', () => {
      test('validates HTTP and HTTPS URLs', () => {
        expect(validateURL('https://example.com')).toBe(true);
        expect(validateURL('http://test.co.uk')).toBe(true);
        expect(validateURL('https://sub.domain.com/path?query=1')).toBe(true);
      });

      test('rejects invalid URLs', () => {
        expect(validateURL('not-a-url')).toBe(false);
        expect(validateURL('ftp://example.com')).toBe(false);
        expect(validateURL('')).toBe(false);
      });
    });

    describe('validateDate', () => {
      test('validates date objects', () => {
        expect(validateDate(new Date())).toBe(true);
        expect(validateDate(new Date('2024-01-01'))).toBe(true);
      });

      test('validates date strings', () => {
        expect(validateDate('2024-01-01')).toBe(true);
        expect(validateDate('01/01/2024')).toBe(true);
      });

      test('rejects invalid dates', () => {
        expect(validateDate('invalid-date')).toBe(false);
        expect(validateDate('2024-13-01')).toBe(false);
        expect(validateDate('')).toBe(false);
      });

      test('validates date ranges', () => {
        const today = new Date();
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

        expect(validateDate(today, { min: yesterday, max: tomorrow })).toBe(true);
        expect(validateDate(yesterday, { min: today })).toBe(false);
        expect(validateDate(tomorrow, { max: today })).toBe(false);
      });
    });

    describe('validateNumberRange', () => {
      test('validates numbers within range', () => {
        expect(validateNumberRange(5, { min: 1, max: 10 })).toBe(true);
        expect(validateNumberRange(1, { min: 1, max: 10 })).toBe(true);
        expect(validateNumberRange(10, { min: 1, max: 10 })).toBe(true);
      });

      test('rejects numbers outside range', () => {
        expect(validateNumberRange(0, { min: 1, max: 10 })).toBe(false);
        expect(validateNumberRange(11, { min: 1, max: 10 })).toBe(false);
      });

      test('handles min-only and max-only constraints', () => {
        expect(validateNumberRange(5, { min: 1 })).toBe(true);
        expect(validateNumberRange(0, { min: 1 })).toBe(false);
        expect(validateNumberRange(5, { max: 10 })).toBe(true);
        expect(validateNumberRange(15, { max: 10 })).toBe(false);
      });
    });

    describe('validateStringLength', () => {
      test('validates string length within range', () => {
        expect(validateStringLength('hello', { min: 1, max: 10 })).toBe(true);
        expect(validateStringLength('a', { min: 1, max: 10 })).toBe(true);
        expect(validateStringLength('1234567890', { min: 1, max: 10 })).toBe(true);
      });

      test('rejects strings outside length range', () => {
        expect(validateStringLength('', { min: 1, max: 10 })).toBe(false);
        expect(validateStringLength('12345678901', { min: 1, max: 10 })).toBe(false);
      });
    });

    describe('validateRequired', () => {
      test('validates required values', () => {
        expect(validateRequired('hello')).toBe(true);
        expect(validateRequired(123)).toBe(true);
        expect(validateRequired(false)).toBe(true);
        expect(validateRequired([])).toBe(true);
      });

      test('rejects empty values', () => {
        expect(validateRequired('')).toBe(false);
        expect(validateRequired(null)).toBe(false);
        expect(validateRequired(undefined)).toBe(false);
        expect(validateRequired('   ')).toBe(false);
      });
    });

    describe('validateCurrency', () => {
      test('validates currency amounts', () => {
        expect(validateCurrency('$123.45')).toBe(true);
        expect(validateCurrency('€1,234.56')).toBe(true);
        expect(validateCurrency('123.45')).toBe(true);
      });

      test('rejects invalid currency formats', () => {
        expect(validateCurrency('abc')).toBe(false);
        expect(validateCurrency('$')).toBe(false);
        expect(validateCurrency('')).toBe(false);
      });
    });

    describe('validatePercentage', () => {
      test('validates percentage values', () => {
        expect(validatePercentage('50%')).toBe(true);
        expect(validatePercentage('0.5')).toBe(true);
        expect(validatePercentage('100')).toBe(true);
      });

      test('rejects invalid percentages', () => {
        expect(validatePercentage('150%')).toBe(false);
        expect(validatePercentage('-10%')).toBe(false);
        expect(validatePercentage('abc')).toBe(false);
      });
    });
  });

  describe('ValidationSchema', () => {
    test('creates validation schema with rules', () => {
      const schema = new ValidationSchema()
        .field('email', [validateRequired, validateEmail])
        .field('age', [validateRequired, (value) => validateNumberRange(value, { min: 18, max: 100 })]);

      expect(schema.fields).toHaveProperty('email');
      expect(schema.fields).toHaveProperty('age');
    });

    test('validates data against schema', () => {
      const schema = new ValidationSchema()
        .field('email', [validateRequired, validateEmail])
        .field('name', [validateRequired]);

      const validData = { email: 'test@example.com', name: 'John Doe' };
      const invalidData = { email: 'invalid-email', name: '' };

      expect(schema.validate(validData).isValid).toBe(true);
      expect(schema.validate(invalidData).isValid).toBe(false);
    });

    test('returns detailed error messages', () => {
      const schema = new ValidationSchema()
        .field('email', [validateRequired, validateEmail], 'Please enter a valid email')
        .field('name', [validateRequired], 'Name is required');

      const result = schema.validate({ email: 'invalid', name: '' });

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty('email');
      expect(result.errors).toHaveProperty('name');
    });
  });

  describe('Common Schemas', () => {
    test('contact schema validates contact data', () => {
      const validContact = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1-555-123-4567',
        company: 'Acme Corp'
      };

      const result = commonSchemas.contact.validate(validContact);
      expect(result.isValid).toBe(true);
    });

    test('lead schema validates lead data', () => {
      const validLead = {
        name: 'Jane Smith',
        email: 'jane@example.com',
        company: 'Tech Corp',
        source: 'Website',
        value: 5000
      };

      const result = commonSchemas.lead.validate(validLead);
      expect(result.isValid).toBe(true);
    });

    test('deal schema validates deal data', () => {
      const validDeal = {
        title: 'Big Sale',
        value: 10000,
        stage: 'Proposal',
        closeDate: new Date(),
        contactId: 'contact-123'
      };

      const result = commonSchemas.deal.validate(validDeal);
      expect(result.isValid).toBe(true);
    });

    test('report filter schema validates filter data', () => {
      const validFilter = {
        dateRange: 'last-30-days',
        status: 'active',
        minValue: 1000,
        maxValue: 50000
      };

      const result = commonSchemas.reportFilter.validate(validFilter);
      expect(result.isValid).toBe(true);
    });
  });

  describe('useValidation Hook', () => {
    test('provides validation state and functions', () => {
      const schema = new ValidationSchema()
        .field('email', [validateRequired, validateEmail]);

      const { result } = renderHook(() => useValidation(schema));

      expect(result.current.errors).toEqual({});
      expect(result.current.isValid).toBe(true);
      expect(typeof result.current.validate).toBe('function');
      expect(typeof result.current.validateField).toBe('function');
      expect(typeof result.current.clearErrors).toBe('function');
    });

    test('validates individual fields', () => {
      const schema = new ValidationSchema()
        .field('email', [validateRequired, validateEmail]);

      const { result } = renderHook(() => useValidation(schema));

      act(() => {
        result.current.validateField('email', 'invalid-email');
      });

      expect(result.current.errors.email).toBeDefined();
      expect(result.current.isValid).toBe(false);
    });

    test('validates entire form', () => {
      const schema = new ValidationSchema()
        .field('email', [validateRequired, validateEmail])
        .field('name', [validateRequired]);

      const { result } = renderHook(() => useValidation(schema));

      act(() => {
        result.current.validate({ email: 'test@example.com', name: 'John' });
      });

      expect(result.current.isValid).toBe(true);
      expect(Object.keys(result.current.errors)).toHaveLength(0);
    });

    test('clears errors', () => {
      const schema = new ValidationSchema()
        .field('email', [validateRequired, validateEmail]);

      const { result } = renderHook(() => useValidation(schema));

      act(() => {
        result.current.validateField('email', 'invalid');
      });

      expect(result.current.errors.email).toBeDefined();

      act(() => {
        result.current.clearErrors();
      });

      expect(result.current.errors).toEqual({});
    });
  });

  describe('API Data Sanitization', () => {
    test('sanitizes API request data', () => {
      const maliciousData = {
        name: '<script>alert("xss")</script>John',
        email: '  TEST@EXAMPLE.COM  ',
        description: 'Normal text with\x00control chars',
        __proto__: { admin: true }
      };

      const sanitized = sanitizeApiData(maliciousData);

      expect(sanitized.name).toBe('John');
      expect(sanitized.email).toBe('test@example.com');
      expect(sanitized.description).toBe('Normal text with control chars');
      expect(sanitized).not.toHaveProperty('__proto__');
    });

    test('handles nested objects', () => {
      const nestedData = {
        user: {
          name: '<script>alert("xss")</script>John',
          profile: {
            bio: 'Bio with\x00control chars'
          }
        }
      };

      const sanitized = sanitizeApiData(nestedData);

      expect(sanitized.user.name).toBe('John');
      expect(sanitized.user.profile.bio).toBe('Bio with control chars');
    });

    test('handles arrays', () => {
      const arrayData = {
        tags: ['<script>tag1</script>', '  TAG2  ', 'tag3\x00']
      };

      const sanitized = sanitizeApiData(arrayData);

      expect(sanitized.tags[0]).toBe('tag1');
      expect(sanitized.tags[1]).toBe('TAG2');
      expect(sanitized.tags[2]).toBe('tag3');
    });
  });

  describe('Security Headers', () => {
    test('provides security headers for API requests', () => {
      const headers = securityHeaders();

      expect(headers).toHaveProperty('Content-Type');
      expect(headers).toHaveProperty('X-Content-Type-Options');
      expect(headers).toHaveProperty('X-Frame-Options');
      expect(headers).toHaveProperty('X-XSS-Protection');
    });

    test('includes CSRF token when provided', () => {
      const headers = securityHeaders('csrf-token-123');

      expect(headers).toHaveProperty('X-CSRF-Token');
      expect(headers['X-CSRF-Token']).toBe('csrf-token-123');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('handles null and undefined inputs gracefully', () => {
      expect(() => sanitizeInput.html(null)).not.toThrow();
      expect(() => sanitizeInput.text(undefined)).not.toThrow();
      expect(() => validateEmail(null)).not.toThrow();
      expect(() => validateRequired(undefined)).not.toThrow();
    });

    test('handles circular references in objects', () => {
      const circularObj = { name: 'test' };
      circularObj.self = circularObj;

      expect(() => sanitizeApiData(circularObj)).not.toThrow();
    });

    test('handles very large strings', () => {
      const largeString = 'a'.repeat(10000);
      
      expect(() => sanitizeInput.text(largeString)).not.toThrow();
      expect(() => validateStringLength(largeString, { max: 5000 })).not.toThrow();
    });

    test('handles special characters and unicode', () => {
      const unicodeString = '🚀 Hello 世界 café';
      
      const sanitized = sanitizeInput.text(unicodeString);
      expect(sanitized).toContain('🚀');
      expect(sanitized).toContain('世界');
      expect(sanitized).toContain('café');
    });
  });
});