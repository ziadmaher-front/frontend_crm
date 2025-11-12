// Data Encryption Hook for Security
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../stores';
import { useNotifications } from '../useNotifications';
import { apiClient } from '../../utils/api';

// Encryption algorithms
const ENCRYPTION_ALGORITHMS = {
  AES_256_GCM: 'AES-256-GCM',
  AES_256_CBC: 'AES-256-CBC',
  RSA_OAEP: 'RSA-OAEP',
  ECDH: 'ECDH',
};

// Key types
const KEY_TYPES = {
  MASTER: 'master',
  DATA: 'data',
  FIELD: 'field',
  SESSION: 'session',
  BACKUP: 'backup',
};

// Sensitive field types that require encryption
const SENSITIVE_FIELDS = {
  EMAIL: 'email',
  PHONE: 'phone',
  SSN: 'ssn',
  CREDIT_CARD: 'credit_card',
  BANK_ACCOUNT: 'bank_account',
  ADDRESS: 'address',
  NOTES: 'notes',
  CUSTOM_FIELD: 'custom_field',
};

// Data classification levels
const DATA_CLASSIFICATION = {
  PUBLIC: 'public',
  INTERNAL: 'internal',
  CONFIDENTIAL: 'confidential',
  RESTRICTED: 'restricted',
};

// Encryption requirements by classification
const ENCRYPTION_REQUIREMENTS = {
  [DATA_CLASSIFICATION.PUBLIC]: { required: false, algorithm: null },
  [DATA_CLASSIFICATION.INTERNAL]: { required: false, algorithm: ENCRYPTION_ALGORITHMS.AES_256_CBC },
  [DATA_CLASSIFICATION.CONFIDENTIAL]: { required: true, algorithm: ENCRYPTION_ALGORITHMS.AES_256_GCM },
  [DATA_CLASSIFICATION.RESTRICTED]: { required: true, algorithm: ENCRYPTION_ALGORITHMS.AES_256_GCM },
};

// Data Encryption Engine
class DataEncryptionEngine {
  constructor() {
    this.keyCache = new Map();
    this.encryptionCache = new Map();
    this.isInitialized = false;
    this.masterKey = null;
  }

  // Initialize encryption engine
  async initialize() {
    if (this.isInitialized) return;

    try {
      // Check if Web Crypto API is available
      if (!window.crypto || !window.crypto.subtle) {
        throw new Error('Web Crypto API not available');
      }

      // Initialize master key (in production, this would be derived from user credentials)
      await this.initializeMasterKey();
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize encryption engine:', error);
      throw error;
    }
  }

  // Initialize master key
  async initializeMasterKey() {
    try {
      // In production, derive from user password + salt
      const keyMaterial = await window.crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode('user-password-salt-combination'),
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
      );

      this.masterKey = await window.crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: new TextEncoder().encode('unique-salt'),
          iterations: 100000,
          hash: 'SHA-256',
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      );
    } catch (error) {
      console.error('Failed to initialize master key:', error);
      throw error;
    }
  }

  // Generate encryption key
  async generateKey(keyType = KEY_TYPES.DATA, algorithm = ENCRYPTION_ALGORITHMS.AES_256_GCM) {
    await this.initialize();

    try {
      let key;
      
      switch (algorithm) {
        case ENCRYPTION_ALGORITHMS.AES_256_GCM:
        case ENCRYPTION_ALGORITHMS.AES_256_CBC:
          key = await window.crypto.subtle.generateKey(
            { name: 'AES-GCM', length: 256 },
            true,
            ['encrypt', 'decrypt']
          );
          break;
        
        case ENCRYPTION_ALGORITHMS.RSA_OAEP:
          key = await window.crypto.subtle.generateKey(
            {
              name: 'RSA-OAEP',
              modulusLength: 2048,
              publicExponent: new Uint8Array([1, 0, 1]),
              hash: 'SHA-256',
            },
            true,
            ['encrypt', 'decrypt']
          );
          break;
        
        default:
          throw new Error(`Unsupported algorithm: ${algorithm}`);
      }

      const keyId = this.generateKeyId();
      this.keyCache.set(keyId, { key, keyType, algorithm, createdAt: new Date() });
      
      return { keyId, key };
    } catch (error) {
      console.error('Failed to generate key:', error);
      throw error;
    }
  }

  // Generate unique key ID
  generateKeyId() {
    return `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Encrypt data
  async encryptData(data, keyId = null, algorithm = ENCRYPTION_ALGORITHMS.AES_256_GCM) {
    await this.initialize();

    try {
      let key;
      
      if (keyId && this.keyCache.has(keyId)) {
        key = this.keyCache.get(keyId).key;
      } else {
        const keyPair = await this.generateKey(KEY_TYPES.DATA, algorithm);
        key = keyPair.key;
        keyId = keyPair.keyId;
      }

      const encodedData = new TextEncoder().encode(JSON.stringify(data));
      const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for GCM

      const encryptedData = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encodedData
      );

      const result = {
        encryptedData: Array.from(new Uint8Array(encryptedData)),
        iv: Array.from(iv),
        keyId,
        algorithm,
        timestamp: new Date().toISOString(),
      };

      return result;
    } catch (error) {
      console.error('Failed to encrypt data:', error);
      throw error;
    }
  }

  // Decrypt data
  async decryptData(encryptedPayload) {
    await this.initialize();

    try {
      const { encryptedData, iv, keyId, algorithm } = encryptedPayload;
      
      if (!this.keyCache.has(keyId)) {
        throw new Error(`Key not found: ${keyId}`);
      }

      const key = this.keyCache.get(keyId).key;
      const encryptedBuffer = new Uint8Array(encryptedData);
      const ivBuffer = new Uint8Array(iv);

      const decryptedData = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: ivBuffer },
        key,
        encryptedBuffer
      );

      const decodedData = new TextDecoder().decode(decryptedData);
      return JSON.parse(decodedData);
    } catch (error) {
      console.error('Failed to decrypt data:', error);
      throw error;
    }
  }

  // Encrypt field-level data
  async encryptField(fieldValue, fieldType, classification = DATA_CLASSIFICATION.CONFIDENTIAL) {
    const requirements = ENCRYPTION_REQUIREMENTS[classification];
    
    if (!requirements.required) {
      return { value: fieldValue, encrypted: false };
    }

    try {
      const encrypted = await this.encryptData(fieldValue, null, requirements.algorithm);
      return {
        value: encrypted,
        encrypted: true,
        fieldType,
        classification,
      };
    } catch (error) {
      console.error('Failed to encrypt field:', error);
      throw error;
    }
  }

  // Decrypt field-level data
  async decryptField(encryptedField) {
    if (!encryptedField.encrypted) {
      return encryptedField.value;
    }

    try {
      return await this.decryptData(encryptedField.value);
    } catch (error) {
      console.error('Failed to decrypt field:', error);
      throw error;
    }
  }

  // Encrypt object with field-level encryption
  async encryptObject(obj, fieldMappings = {}) {
    const encryptedObj = { ...obj };
    
    for (const [fieldName, fieldConfig] of Object.entries(fieldMappings)) {
      if (obj[fieldName] !== undefined && obj[fieldName] !== null) {
        const { fieldType, classification } = fieldConfig;
        encryptedObj[fieldName] = await this.encryptField(
          obj[fieldName],
          fieldType,
          classification
        );
      }
    }

    return encryptedObj;
  }

  // Decrypt object with field-level decryption
  async decryptObject(encryptedObj, fieldMappings = {}) {
    const decryptedObj = { ...encryptedObj };
    
    for (const fieldName of Object.keys(fieldMappings)) {
      if (encryptedObj[fieldName] && encryptedObj[fieldName].encrypted) {
        decryptedObj[fieldName] = await this.decryptField(encryptedObj[fieldName]);
      }
    }

    return decryptedObj;
  }

  // Hash sensitive data for searching
  async hashForSearch(data) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data.toLowerCase().trim());
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Generate data integrity hash
  async generateIntegrityHash(data) {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(JSON.stringify(data));
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Verify data integrity
  async verifyIntegrity(data, expectedHash) {
    const actualHash = await this.generateIntegrityHash(data);
    return actualHash === expectedHash;
  }

  // Secure data wipe
  secureWipe(data) {
    if (typeof data === 'string') {
      // Overwrite string with random data
      const randomData = Array.from({ length: data.length }, () => 
        String.fromCharCode(Math.floor(Math.random() * 256))
      ).join('');
      return randomData;
    } else if (data instanceof Uint8Array) {
      // Overwrite array with random bytes
      window.crypto.getRandomValues(data);
      return data;
    }
    return null;
  }

  // Export key (encrypted with master key)
  async exportKey(keyId) {
    if (!this.keyCache.has(keyId)) {
      throw new Error(`Key not found: ${keyId}`);
    }

    const keyData = this.keyCache.get(keyId);
    const exportedKey = await window.crypto.subtle.exportKey('raw', keyData.key);
    
    // Encrypt with master key
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encryptedKey = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      this.masterKey,
      exportedKey
    );

    return {
      keyId,
      encryptedKey: Array.from(new Uint8Array(encryptedKey)),
      iv: Array.from(iv),
      keyType: keyData.keyType,
      algorithm: keyData.algorithm,
      createdAt: keyData.createdAt,
    };
  }

  // Import key (decrypt with master key)
  async importKey(exportedKeyData) {
    const { keyId, encryptedKey, iv, keyType, algorithm } = exportedKeyData;
    
    const encryptedBuffer = new Uint8Array(encryptedKey);
    const ivBuffer = new Uint8Array(iv);

    const decryptedKey = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: ivBuffer },
      this.masterKey,
      encryptedBuffer
    );

    const key = await window.crypto.subtle.importKey(
      'raw',
      decryptedKey,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );

    this.keyCache.set(keyId, { key, keyType, algorithm, createdAt: new Date() });
    return keyId;
  }

  // Rotate encryption key
  async rotateKey(oldKeyId) {
    const oldKeyData = this.keyCache.get(oldKeyId);
    if (!oldKeyData) {
      throw new Error(`Key not found: ${oldKeyId}`);
    }

    const newKeyPair = await this.generateKey(oldKeyData.keyType, oldKeyData.algorithm);
    
    // Mark old key as deprecated
    this.keyCache.set(oldKeyId, { ...oldKeyData, deprecated: true });
    
    return newKeyPair.keyId;
  }

  // Clean up deprecated keys
  cleanupDeprecatedKeys() {
    const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    
    for (const [keyId, keyData] of this.keyCache.entries()) {
      if (keyData.deprecated && keyData.createdAt < cutoffDate) {
        this.keyCache.delete(keyId);
      }
    }
  }
}

const useDataEncryption = () => {
  const [encryptionEngine] = useState(() => new DataEncryptionEngine());
  const [isInitialized, setIsInitialized] = useState(false);
  const { user, isAuthenticated } = useAuthStore();
  const { addNotification } = useNotifications();
  const queryClient = useQueryClient();

  // Initialize encryption engine
  useEffect(() => {
    if (isAuthenticated && !isInitialized) {
      encryptionEngine.initialize()
        .then(() => setIsInitialized(true))
        .catch(error => {
          console.error('Failed to initialize encryption:', error);
          addNotification({
            type: 'error',
            title: 'Encryption Error',
            message: 'Failed to initialize data encryption',
          });
        });
    }
  }, [isAuthenticated, isInitialized, encryptionEngine, addNotification]);

  // Fetch encryption settings
  const {
    data: encryptionSettings = {},
    isLoading: settingsLoading,
  } = useQuery(
    'encryption-settings',
    () => apiClient.get('/security/encryption-settings'),
    {
      enabled: isAuthenticated && isInitialized,
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  // Encrypt data
  const encryptData = useCallback(async (data, keyId = null, algorithm = ENCRYPTION_ALGORITHMS.AES_256_GCM) => {
    if (!isInitialized) {
      throw new Error('Encryption engine not initialized');
    }

    try {
      return await encryptionEngine.encryptData(data, keyId, algorithm);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Encryption Failed',
        message: 'Failed to encrypt data',
      });
      throw error;
    }
  }, [isInitialized, encryptionEngine, addNotification]);

  // Decrypt data
  const decryptData = useCallback(async (encryptedPayload) => {
    if (!isInitialized) {
      throw new Error('Encryption engine not initialized');
    }

    try {
      return await encryptionEngine.decryptData(encryptedPayload);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Decryption Failed',
        message: 'Failed to decrypt data',
      });
      throw error;
    }
  }, [isInitialized, encryptionEngine, addNotification]);

  // Encrypt field
  const encryptField = useCallback(async (fieldValue, fieldType, classification = DATA_CLASSIFICATION.CONFIDENTIAL) => {
    if (!isInitialized) {
      return { value: fieldValue, encrypted: false };
    }

    try {
      return await encryptionEngine.encryptField(fieldValue, fieldType, classification);
    } catch (error) {
      console.error('Field encryption failed:', error);
      return { value: fieldValue, encrypted: false };
    }
  }, [isInitialized, encryptionEngine]);

  // Decrypt field
  const decryptField = useCallback(async (encryptedField) => {
    if (!isInitialized || !encryptedField.encrypted) {
      return encryptedField.value;
    }

    try {
      return await encryptionEngine.decryptField(encryptedField);
    } catch (error) {
      console.error('Field decryption failed:', error);
      return '[DECRYPTION_FAILED]';
    }
  }, [isInitialized, encryptionEngine]);

  // Encrypt object
  const encryptObject = useCallback(async (obj, fieldMappings = {}) => {
    if (!isInitialized) {
      return obj;
    }

    try {
      return await encryptionEngine.encryptObject(obj, fieldMappings);
    } catch (error) {
      console.error('Object encryption failed:', error);
      return obj;
    }
  }, [isInitialized, encryptionEngine]);

  // Decrypt object
  const decryptObject = useCallback(async (encryptedObj, fieldMappings = {}) => {
    if (!isInitialized) {
      return encryptedObj;
    }

    try {
      return await encryptionEngine.decryptObject(encryptedObj, fieldMappings);
    } catch (error) {
      console.error('Object decryption failed:', error);
      return encryptedObj;
    }
  }, [isInitialized, encryptionEngine]);

  // Generate key
  const generateKey = useCallback(async (keyType = KEY_TYPES.DATA, algorithm = ENCRYPTION_ALGORITHMS.AES_256_GCM) => {
    if (!isInitialized) {
      throw new Error('Encryption engine not initialized');
    }

    try {
      return await encryptionEngine.generateKey(keyType, algorithm);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Key Generation Failed',
        message: 'Failed to generate encryption key',
      });
      throw error;
    }
  }, [isInitialized, encryptionEngine, addNotification]);

  // Hash for search
  const hashForSearch = useCallback(async (data) => {
    if (!isInitialized) {
      return data;
    }

    try {
      return await encryptionEngine.hashForSearch(data);
    } catch (error) {
      console.error('Hashing failed:', error);
      return data;
    }
  }, [isInitialized, encryptionEngine]);

  // Generate integrity hash
  const generateIntegrityHash = useCallback(async (data) => {
    if (!isInitialized) {
      return null;
    }

    try {
      return await encryptionEngine.generateIntegrityHash(data);
    } catch (error) {
      console.error('Integrity hash generation failed:', error);
      return null;
    }
  }, [isInitialized, encryptionEngine]);

  // Verify integrity
  const verifyIntegrity = useCallback(async (data, expectedHash) => {
    if (!isInitialized || !expectedHash) {
      return true;
    }

    try {
      return await encryptionEngine.verifyIntegrity(data, expectedHash);
    } catch (error) {
      console.error('Integrity verification failed:', error);
      return false;
    }
  }, [isInitialized, encryptionEngine]);

  // Key management mutations
  const rotateKeyMutation = useMutation(
    (keyId) => encryptionEngine.rotateKey(keyId),
    {
      onSuccess: () => {
        addNotification({
          type: 'success',
          title: 'Key Rotated',
          message: 'Encryption key has been rotated successfully',
        });
      },
      onError: (error) => {
        addNotification({
          type: 'error',
          title: 'Key Rotation Failed',
          message: error.message || 'Failed to rotate encryption key',
        });
      },
    }
  );

  // Update encryption settings
  const updateSettingsMutation = useMutation(
    (settings) => apiClient.put('/security/encryption-settings', settings),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('encryption-settings');
        addNotification({
          type: 'success',
          title: 'Settings Updated',
          message: 'Encryption settings have been updated successfully',
        });
      },
      onError: (error) => {
        addNotification({
          type: 'error',
          title: 'Update Failed',
          message: error.message || 'Failed to update encryption settings',
        });
      },
    }
  );

  // Utility functions
  const rotateKey = useCallback((keyId) => {
    return rotateKeyMutation.mutateAsync(keyId);
  }, [rotateKeyMutation]);

  const updateSettings = useCallback((settings) => {
    return updateSettingsMutation.mutateAsync(settings);
  }, [updateSettingsMutation]);

  // Get field mappings for common entities
  const getFieldMappings = useCallback((entityType) => {
    const mappings = {
      lead: {
        email: { fieldType: SENSITIVE_FIELDS.EMAIL, classification: DATA_CLASSIFICATION.CONFIDENTIAL },
        phone: { fieldType: SENSITIVE_FIELDS.PHONE, classification: DATA_CLASSIFICATION.CONFIDENTIAL },
        notes: { fieldType: SENSITIVE_FIELDS.NOTES, classification: DATA_CLASSIFICATION.INTERNAL },
      },
      contact: {
        email: { fieldType: SENSITIVE_FIELDS.EMAIL, classification: DATA_CLASSIFICATION.CONFIDENTIAL },
        phone: { fieldType: SENSITIVE_FIELDS.PHONE, classification: DATA_CLASSIFICATION.CONFIDENTIAL },
        address: { fieldType: SENSITIVE_FIELDS.ADDRESS, classification: DATA_CLASSIFICATION.CONFIDENTIAL },
        notes: { fieldType: SENSITIVE_FIELDS.NOTES, classification: DATA_CLASSIFICATION.INTERNAL },
      },
      deal: {
        notes: { fieldType: SENSITIVE_FIELDS.NOTES, classification: DATA_CLASSIFICATION.INTERNAL },
      },
      company: {
        notes: { fieldType: SENSITIVE_FIELDS.NOTES, classification: DATA_CLASSIFICATION.INTERNAL },
      },
    };

    return mappings[entityType] || {};
  }, []);

  // Cleanup function
  useEffect(() => {
    const cleanup = () => {
      encryptionEngine.cleanupDeprecatedKeys();
    };

    const interval = setInterval(cleanup, 24 * 60 * 60 * 1000); // Daily cleanup
    return () => clearInterval(interval);
  }, [encryptionEngine]);

  return {
    // State
    isInitialized,
    encryptionSettings,
    isLoading: settingsLoading,

    // Encryption functions
    encryptData,
    decryptData,
    encryptField,
    decryptField,
    encryptObject,
    decryptObject,

    // Key management
    generateKey,
    rotateKey,

    // Utility functions
    hashForSearch,
    generateIntegrityHash,
    verifyIntegrity,
    getFieldMappings,

    // Settings
    updateSettings,

    // Mutation states
    isRotatingKey: rotateKeyMutation.isLoading,
    isUpdatingSettings: updateSettingsMutation.isLoading,

    // Constants
    ENCRYPTION_ALGORITHMS,
    KEY_TYPES,
    SENSITIVE_FIELDS,
    DATA_CLASSIFICATION,

    // Engine
    encryptionEngine,
  };
};

export default useDataEncryption;