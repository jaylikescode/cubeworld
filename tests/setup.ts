import { beforeAll, afterAll, afterEach } from 'vitest';

// Setup global test environment
beforeAll(() => {
  // Initialize any global test configuration
  console.log('Test suite starting...');
});

afterAll(() => {
  // Cleanup after all tests
  console.log('Test suite completed.');
});

afterEach(() => {
  // Cleanup after each test
  // This will be useful for cleaning up Three.js objects
});

// Mock WebGL context if needed for Three.js tests
if (typeof window !== 'undefined' && !window.WebGLRenderingContext) {
  // @ts-expect-error - Mocking WebGL context for tests
  window.WebGLRenderingContext = class {};
  // @ts-expect-error - Mocking WebGL context for tests
  window.WebGL2RenderingContext = class {};
}
