import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Automatically clean up React DOM trees after each test
afterEach(() => {
  cleanup();
});
