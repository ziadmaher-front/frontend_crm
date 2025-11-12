/**
 * Test Setup Configuration
 * Configures Jest environment for testing React components and advanced features
 */

import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import { testSetup, customMatchers } from './utils/testUtils';

// Configure testing library
configure({
  testIdAttribute: 'data-testid',
  asyncUtilTimeout: 5000,
  computedStyleSupportsPseudoElements: true
});

// Add custom matchers
expect.extend(customMatchers);

// Global test setup
beforeEach(() => {
  testSetup.beforeEach();
});

afterEach(() => {
  testSetup.afterEach();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock navigator.clipboard to prevent redefinition errors
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: jest.fn(() => Promise.resolve()),
    readText: jest.fn(() => Promise.resolve(''))
  },
  writable: true,
  configurable: true
});

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock MutationObserver
global.MutationObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  takeRecords: jest.fn(),
}));

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 0));
global.cancelAnimationFrame = jest.fn(id => clearTimeout(id));

// Mock performance API
global.performance = {
  ...global.performance,
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByName: jest.fn(() => []),
  getEntriesByType: jest.fn(() => []),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn(),
  now: jest.fn(() => Date.now())
};

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
});

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new Blob()),
  })
);

// Mock WebSocket
global.WebSocket = jest.fn().mockImplementation(() => ({
  send: jest.fn(),
  close: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  readyState: 1, // OPEN
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3
}));

// Mock geolocation
const mockGeolocation = {
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn()
};
Object.defineProperty(navigator, 'geolocation', {
  value: mockGeolocation
});

// Mock caches API for Service Worker tests
const mockCache = {
  match: jest.fn(() => Promise.resolve()),
  matchAll: jest.fn(() => Promise.resolve([])),
  add: jest.fn(() => Promise.resolve()),
  addAll: jest.fn(() => Promise.resolve()),
  put: jest.fn(() => Promise.resolve()),
  delete: jest.fn(() => Promise.resolve(true)),
  keys: jest.fn(() => Promise.resolve([]))
};

global.caches = {
  open: jest.fn(() => Promise.resolve(mockCache)),
  match: jest.fn(() => Promise.resolve()),
  has: jest.fn(() => Promise.resolve(true)),
  delete: jest.fn(() => Promise.resolve(true)),
  keys: jest.fn(() => Promise.resolve(['v1']))
};

// Mock IndexedDB for offline storage tests
const mockIDBRequest = {
  result: {},
  error: null,
  onsuccess: null,
  onerror: null,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn()
};

const mockIDBDatabase = {
  createObjectStore: jest.fn(() => ({
    createIndex: jest.fn(),
    add: jest.fn(() => mockIDBRequest),
    put: jest.fn(() => mockIDBRequest),
    get: jest.fn(() => mockIDBRequest),
    delete: jest.fn(() => mockIDBRequest),
    clear: jest.fn(() => mockIDBRequest),
    openCursor: jest.fn(() => mockIDBRequest)
  })),
  transaction: jest.fn(() => ({
    objectStore: jest.fn(() => ({
      add: jest.fn(() => mockIDBRequest),
      put: jest.fn(() => mockIDBRequest),
      get: jest.fn(() => mockIDBRequest),
      delete: jest.fn(() => mockIDBRequest),
      clear: jest.fn(() => mockIDBRequest),
      openCursor: jest.fn(() => mockIDBRequest),
      index: jest.fn(() => ({
        get: jest.fn(() => mockIDBRequest),
        openCursor: jest.fn(() => mockIDBRequest)
      }))
    })),
    oncomplete: null,
    onerror: null,
    addEventListener: jest.fn()
  })),
  close: jest.fn()
};

global.indexedDB = {
  open: jest.fn(() => {
    const request = { ...mockIDBRequest };
    request.result = mockIDBDatabase;
    setTimeout(() => {
      if (request.onsuccess) request.onsuccess({ target: request });
    }, 0);
    return request;
  }),
  deleteDatabase: jest.fn(() => mockIDBRequest),
  cmp: jest.fn()
};

// Clipboard API already mocked above

// Mock notifications API
const mockNotification = {
  permission: 'granted',
  requestPermission: jest.fn(() => Promise.resolve('granted'))
};
Object.defineProperty(window, 'Notification', {
  value: jest.fn().mockImplementation(() => ({
    close: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
  }))
});
Object.assign(window.Notification, mockNotification);

// Mock media devices
const mockMediaDevices = {
  getUserMedia: jest.fn(() => Promise.resolve({
    getTracks: () => [],
    getVideoTracks: () => [],
    getAudioTracks: () => []
  })),
  enumerateDevices: jest.fn(() => Promise.resolve([]))
};
Object.defineProperty(navigator, 'mediaDevices', {
  value: mockMediaDevices
});

// Mock canvas context
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  getImageData: jest.fn(() => ({ data: new Array(4) })),
  putImageData: jest.fn(),
  createImageData: jest.fn(() => ({ data: new Array(4) })),
  setTransform: jest.fn(),
  drawImage: jest.fn(),
  save: jest.fn(),
  fillText: jest.fn(),
  restore: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  closePath: jest.fn(),
  stroke: jest.fn(),
  translate: jest.fn(),
  scale: jest.fn(),
  rotate: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  measureText: jest.fn(() => ({ width: 0 })),
  transform: jest.fn(),
  rect: jest.fn(),
  clip: jest.fn(),
}));

// Mock SVG elements
Object.defineProperty(SVGElement.prototype, 'getBBox', {
  value: jest.fn(() => ({
    x: 0,
    y: 0,
    width: 100,
    height: 100
  }))
});

// Mock CSS.supports
Object.defineProperty(window, 'CSS', {
  value: {
    supports: jest.fn(() => true)
  }
});

// Mock console methods to reduce noise in tests
const originalConsole = { ...console };
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
  log: jest.fn(),
  info: jest.fn(),
  debug: jest.fn()
};

// Restore console for specific tests if needed
global.restoreConsole = () => {
  global.console = originalConsole;
};

// Mock gtag for analytics
global.gtag = jest.fn();

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.REACT_APP_API_URL = 'http://localhost:3001/api';

// Suppress React 18 warnings in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Increase timeout for integration tests
jest.setTimeout(30000);