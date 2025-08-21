import '@testing-library/jest-dom/vitest';

// Add ResizeObserver polyfill for tests
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
