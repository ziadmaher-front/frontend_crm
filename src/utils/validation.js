/**
 * Comprehensive input validation and data sanitization utilities
 * Provides secure validation for all user inputs and data processing
 */

// Input sanitization utilities
export const sanitizeInput = {
  // Remove HTML tags and dangerous characters
  html: (input) => {
    if (typeof input !== 'string') return '';
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  },

  // Sanitize SQL injection attempts
  sql: (input) => {
    if (typeof input !== 'string') return '';
    return input
      .replace(/['";\\]/g, '')
      .replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi, '')
      .trim();
  },

  // Sanitize for safe JSON parsing
  json: (input) => {
    if (typeof input !== 'string') return '';
    try {
      return JSON.stringify(JSON.parse(input));
    } catch {
      return '';
    }
  },

  // General text sanitization
  text: (input) => {
    if (typeof input !== 'string') return '';
    return input
      // Remove script tags with potentially malicious content
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, (match) => {
        // If the script contains function calls, alerts, etc., remove entirely
        const content = match.replace(/<\/?script[^>]*>/gi, '');
        if (/\b(alert|eval|function|document|window|location)\s*\(/.test(content)) {
          return '';
        }
        // Otherwise, just remove the tags but keep the content
        return content;
      })
      .replace(/<[^>]*>/g, '') // Remove other HTML tags but keep content
      .replace(/[\x00-\x1F\x7F]/g, ' ') // Replace control characters with space
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  },

  // Sanitize numbers
  number: (input) => {
    const num = parseFloat(input);
    return isNaN(num) ? 0 : num;
  },

  // Sanitize email addresses
  email: (input) => {
    if (typeof input !== 'string') return '';
    return input.toLowerCase().trim().replace(/[^a-z0-9@._-]/g, '');
  }
};

// Validation rules
export const validators = {
  // Email validation
  email: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Phone number validation
  phone: (phone) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  },

  // URL validation
  url: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  // Date validation
  date: (date) => {
    const dateObj = new Date(date);
    return dateObj instanceof Date && !isNaN(dateObj);
  },

  // Number range validation
  numberRange: (value, min = -Infinity, max = Infinity) => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= min && num <= max;
  },

  // String length validation
  stringLength: (str, minLength = 0, maxLength = Infinity) => {
    return typeof str === 'string' && 
           str.length >= minLength && 
           str.length <= maxLength;
  },

  // Required field validation
  required: (value) => {
    return value !== null && 
           value !== undefined && 
           value !== '' && 
           (Array.isArray(value) ? value.length > 0 : true);
  },

  // Currency validation
  currency: (value) => {
    const currencyRegex = /^\$?[\d,]+(\.\d{2})?$/;
    return currencyRegex.test(value.toString());
  },

  // Percentage validation
  percentage: (value) => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0 && num <= 100;
  }
};

// Form validation schema builder
export class ValidationSchema {
  constructor() {
    this.rules = {};
    this.errors = {};
  }

  // Add validation rule
  addRule(field, validator, message) {
    if (!this.rules[field]) {
      this.rules[field] = [];
    }
    this.rules[field].push({ validator, message });
    return this;
  }

  // Alias for addRule to support fluent API
  field(fieldName, validators, message) {
    if (Array.isArray(validators)) {
      validators.forEach((validator, index) => {
        const msg = Array.isArray(message) ? message[index] : `${fieldName} is invalid`;
        this.addRule(fieldName, validator, msg);
      });
    } else {
      this.addRule(fieldName, validators, message || `${fieldName} is invalid`);
    }
    return this;
  }

  // Validate data against schema
  validate(data) {
    this.errors = {};
    let isValid = true;

    Object.keys(this.rules).forEach(field => {
      const fieldRules = this.rules[field];
      const fieldValue = data[field];

      fieldRules.forEach(rule => {
        if (!rule.validator(fieldValue)) {
          if (!this.errors[field]) {
            this.errors[field] = [];
          }
          this.errors[field].push(rule.message);
          isValid = false;
        }
      });
    });

    return {
      isValid,
      errors: this.errors,
      sanitizedData: this.sanitizeData(data)
    };
  }

  // Sanitize data based on field types
  sanitizeData(data) {
    const sanitized = {};
    
    Object.keys(data).forEach(key => {
      const value = data[key];
      
      // Auto-detect and sanitize based on field name patterns
      if (key.includes('email')) {
        sanitized[key] = sanitizeInput.email(value);
      } else if (key.includes('phone')) {
        sanitized[key] = sanitizeInput.text(value);
      } else if (key.includes('url') || key.includes('link')) {
        sanitized[key] = sanitizeInput.text(value);
      } else if (key.includes('amount') || key.includes('price') || key.includes('revenue')) {
        sanitized[key] = sanitizeInput.number(value);
      } else if (typeof value === 'string') {
        sanitized[key] = sanitizeInput.text(value);
      } else if (typeof value === 'number') {
        sanitized[key] = sanitizeInput.number(value);
      } else {
        sanitized[key] = value;
      }
    });

    return sanitized;
  }

  // Get validation errors
  getErrors() {
    return this.errors;
  }

  // Check if field has errors
  hasError(field) {
    return this.errors[field] && this.errors[field].length > 0;
  }

  // Get field errors
  getFieldErrors(field) {
    return this.errors[field] || [];
  }
}

// Pre-built validation schemas for common forms
export const commonSchemas = {
  // Contact form validation
  contact: () => new ValidationSchema()
    .addRule('name', validators.required, 'Name is required')
    .addRule('name', (v) => validators.stringLength(v, 2, 50), 'Name must be 2-50 characters')
    .addRule('email', validators.required, 'Email is required')
    .addRule('email', validators.email, 'Invalid email format')
    .addRule('phone', (v) => !v || validators.phone(v), 'Invalid phone number'),

  // Lead form validation
  lead: () => new ValidationSchema()
    .addRule('company', validators.required, 'Company name is required')
    .addRule('company', (v) => validators.stringLength(v, 2, 100), 'Company name must be 2-100 characters')
    .addRule('contactName', validators.required, 'Contact name is required')
    .addRule('email', validators.required, 'Email is required')
    .addRule('email', validators.email, 'Invalid email format')
    .addRule('dealValue', (v) => !v || validators.numberRange(v, 0), 'Deal value must be positive'),

  // Deal form validation
  deal: () => new ValidationSchema()
    .addRule('title', validators.required, 'Deal title is required')
    .addRule('title', (v) => validators.stringLength(v, 3, 100), 'Title must be 3-100 characters')
    .addRule('amount', validators.required, 'Deal amount is required')
    .addRule('amount', (v) => validators.numberRange(v, 0), 'Amount must be positive')
    .addRule('probability', (v) => !v || validators.percentage(v), 'Probability must be 0-100%')
    .addRule('closeDate', validators.required, 'Close date is required')
    .addRule('closeDate', validators.date, 'Invalid date format'),

  // Report filter validation
  reportFilter: () => new ValidationSchema()
    .addRule('startDate', validators.date, 'Invalid start date')
    .addRule('endDate', validators.date, 'Invalid end date')
    .addRule('dateRange', (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
      }
      return true;
    }, 'Start date must be before end date')
    .addRule('limit', (v) => !v || validators.numberRange(v, 1, 1000), 'Limit must be 1-1000')
};

// Real-time validation hook for React components
export const useValidation = (schema) => {
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(true);

  const validate = useCallback((data) => {
    const result = schema.validate(data);
    setErrors(result.errors);
    setIsValid(result.isValid);
    return result;
  }, [schema]);

  const validateField = useCallback((field, value, data = {}) => {
    const fieldData = { ...data, [field]: value };
    const result = schema.validate(fieldData);
    
    setErrors(prev => ({
      ...prev,
      [field]: result.errors[field] || []
    }));

    return !result.errors[field] || result.errors[field].length === 0;
  }, [schema]);

  const clearErrors = useCallback(() => {
    setErrors({});
    setIsValid(true);
  }, []);

  const clearFieldError = useCallback((field) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  return {
    errors,
    isValid,
    validate,
    validateField,
    clearErrors,
    clearFieldError,
    hasError: (field) => errors[field] && errors[field].length > 0,
    getFieldErrors: (field) => errors[field] || []
  };
};

// Data sanitization for API requests
export const sanitizeApiData = (data, visited = new WeakSet(), parentKey = '') => {
  // Handle circular references
  if (data && typeof data === 'object' && visited.has(data)) {
    return '[Circular Reference]';
  }
  
  if (Array.isArray(data)) {
    visited.add(data);
    const result = data.map(item => sanitizeApiData(item, visited, parentKey));
    visited.delete(data);
    return result;
  }
  
  if (data && typeof data === 'object') {
    visited.add(data);
    const sanitized = Object.create(null); // Create object without prototype
    Object.keys(data).forEach(key => {
      // Skip prototype pollution attempts
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        return;
      }
      sanitized[key] = sanitizeApiData(data[key], visited, key);
    });
    visited.delete(data);
    return sanitized;
  }
  
  if (typeof data === 'string') {
    // Use email sanitization for email fields
    if (parentKey && parentKey.toLowerCase().includes('email')) {
      return sanitizeInput.email(data);
    }
    return sanitizeInput.text(data);
  }
  
  return data;
};

// Security headers for API requests
export const securityHeaders = (csrfToken = null) => {
  const headers = {
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  };
  
  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
  }
  
  return headers;
};

export default {
  sanitizeInput,
  validators,
  ValidationSchema,
  commonSchemas,
  useValidation,
  sanitizeApiData,
  securityHeaders
};