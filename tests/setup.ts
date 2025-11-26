import { beforeAll, afterAll, afterEach, vi } from 'vitest';

// Setup global test environment
beforeAll(() => {
  // Initialize any global test configuration
  console.log('Test suite starting...');

  // Mock HTMLCanvasElement.getContext for TextureAtlas
  if (typeof HTMLCanvasElement !== 'undefined') {
    HTMLCanvasElement.prototype.getContext = vi.fn((contextId: string) => {
      if (contextId === '2d') {
        return {
          clearRect: vi.fn(),
          fillRect: vi.fn(),
          fillStyle: '',
          strokeStyle: '',
          lineWidth: 1,
          beginPath: vi.fn(),
          moveTo: vi.fn(),
          lineTo: vi.fn(),
          stroke: vi.fn(),
          arc: vi.fn(),
          save: vi.fn(),
          restore: vi.fn(),
          translate: vi.fn(),
          rotate: vi.fn(),
          scale: vi.fn(),
          drawImage: vi.fn(),
        } as unknown as CanvasRenderingContext2D;
      }
      return null;
    });
  }
});

afterAll(() => {
  // Cleanup after all tests
  console.log('Test suite completed.');
});

afterEach(() => {
  // Cleanup after each test
  // This will be useful for cleaning up Three.js objects
  vi.clearAllMocks();
});

// Mock WebGL context if needed for Three.js tests
if (typeof window !== 'undefined' && !window.WebGLRenderingContext) {
  // @ts-expect-error - Mocking WebGL context for tests
  window.WebGLRenderingContext = class {};
  // @ts-expect-error - Mocking WebGL context for tests
  window.WebGL2RenderingContext = class {};
}
