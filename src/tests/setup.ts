import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Sin globals: true en vitest, Testing Library no registra su auto-cleanup.
afterEach(() => {
  cleanup();
});
