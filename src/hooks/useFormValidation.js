import { useState, useCallback, useMemo } from 'react';

// Validation rules
export const validationRules = {
  required: (value) => {
    if (value === null || value === undefined || value === '') {
      return 'This field is required';
    }
    return null;
  },

  email: (value) => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? null : 'Please enter a valid email address';
  },

  phone: (value) => {
    if (!value) return null;
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(value.replace(/[\s\-\(\)]/g, '')) ? null : 'Please enter a valid phone number';
  },

  minLength: (min) => (value) => {
    if (!value) return null;
    return value.length >= min ? null : `Must be at least ${min} characters long`;
  },

  maxLength: (max) => (value) => {
    if (!value) return null;
    return value.length <= max ? null : `Must be no more than ${max} characters long`;
  },

  min: (min) => (value) => {
    if (value === null || value === undefined || value === '') return null;
    const numValue = Number(value);
    return numValue >= min ? null : `Must be at least ${min}`;
  },

  max: (max) => (value) => {
    if (value === null || value === undefined || value === '') return null;
    const numValue = Number(value);
    return numValue <= max ? null : `Must be no more than ${max}`;
  },

  pattern: (regex, message = 'Invalid format') => (value) => {
    if (!value) return null;
    return regex.test(value) ? null : message;
  },

  url: (value) => {
    if (!value) return null;
    try {
      new URL(value);
      return null;
    } catch {
      return 'Please enter a valid URL';
    }
  },

  date: (value) => {
    if (!value) return null;
    const date = new Date(value);
    return !isNaN(date.getTime()) ? null : 'Please enter a valid date';
  },

  futureDate: (value) => {
    if (!value) return null;
    const date = new Date(value);
    const now = new Date();
    return date > now ? null : 'Date must be in the future';
  },

  pastDate: (value) => {
    if (!value) return null;
    const date = new Date(value);
    const now = new Date();
    return date < now ? null : 'Date must be in the past';
  },

  custom: (validator, message) => (value) => {
    return validator(value) ? null : message;
  }
};

// Common validation schemas
export const commonSchemas = {
  contact: {
    firstName: [validationRules.required, validationRules.maxLength(50)],
    lastName: [validationRules.required, validationRules.maxLength(50)],
    email: [validationRules.required, validationRules.email],
    phone: [validationRules.phone],
    company: [validationRules.maxLength(100)]
  },

  account: {
    name: [validationRules.required, validationRules.maxLength(100)],
    industry: [validationRules.maxLength(50)],
    website: [validationRules.url],
    phone: [validationRules.phone],
    email: [validationRules.email]
  },

  deal: {
    name: [validationRules.required, validationRules.maxLength(100)],
    amount: [validationRules.required, validationRules.min(0)],
    stage: [validationRules.required],
    closeDate: [validationRules.required, validationRules.date, validationRules.futureDate]
  },

  lead: {
    firstName: [validationRules.required, validationRules.maxLength(50)],
    lastName: [validationRules.required, validationRules.maxLength(50)],
    email: [validationRules.required, validationRules.email],
    phone: [validationRules.phone],
    company: [validationRules.maxLength(100)],
    source: [validationRules.required]
  },

  task: {
    title: [validationRules.required, validationRules.maxLength(200)],
    description: [validationRules.maxLength(1000)],
    dueDate: [validationRules.date],
    priority: [validationRules.required]
  }
};

export const useFormValidation = (initialValues = {}, validationSchema = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate a single field
  const validateField = useCallback((name, value) => {
    const fieldRules = validationSchema[name];
    if (!fieldRules) return null;

    for (const rule of fieldRules) {
      const error = rule(value);
      if (error) return error;
    }
    return null;
  }, [validationSchema]);

  // Validate all fields
  const validateForm = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationSchema).forEach(fieldName => {
      const error = validateField(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validateField, validationSchema]);

  // Handle field change
  const handleChange = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [errors]);

  // Handle field blur
  const handleBlur = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate field on blur
    const error = validateField(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [validateField, values]);

  // Handle form submission
  const handleSubmit = useCallback(async (onSubmit) => {
    setIsSubmitting(true);
    
    // Mark all fields as touched
    const allTouched = Object.keys(validationSchema).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    // Validate form
    const isValid = validateForm();
    
    if (isValid) {
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
        throw error;
      }
    }
    
    setIsSubmitting(false);
    return isValid;
  }, [values, validateForm, validationSchema]);

  // Reset form
  const reset = useCallback((newValues = initialValues) => {
    setValues(newValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Set field error manually
  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  // Set multiple field errors
  const setFieldErrors = useCallback((newErrors) => {
    setErrors(prev => ({ ...prev, ...newErrors }));
  }, []);

  // Get field props for easy integration with form components
  const getFieldProps = useCallback((name) => ({
    name,
    value: values[name] || '',
    onChange: (e) => {
      const value = e.target ? e.target.value : e;
      handleChange(name, value);
    },
    onBlur: () => handleBlur(name),
    error: touched[name] ? errors[name] : null,
    hasError: touched[name] && !!errors[name]
  }), [values, errors, touched, handleChange, handleBlur]);

  // Check if form is valid
  const isValid = useMemo(() => {
    return Object.keys(validationSchema).every(fieldName => {
      const error = validateField(fieldName, values[fieldName]);
      return !error;
    });
  }, [values, validateField, validationSchema]);

  // Check if form has been modified
  const isDirty = useMemo(() => {
    return Object.keys(values).some(key => values[key] !== initialValues[key]);
  }, [values, initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setFieldError,
    setFieldErrors,
    getFieldProps,
    validateField,
    validateForm
  };
};

export default useFormValidation;