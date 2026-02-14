import '@testing-library/jest-dom/vitest';

if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = vi.fn();
}

if (!HTMLElement.prototype.hasPointerCapture) {
  HTMLElement.prototype.hasPointerCapture = vi.fn(() => false);
}

if (!HTMLElement.prototype.setPointerCapture) {
  HTMLElement.prototype.setPointerCapture = vi.fn();
}

if (!HTMLElement.prototype.releasePointerCapture) {
  HTMLElement.prototype.releasePointerCapture = vi.fn();
}

if (!globalThis.ResizeObserver) {
  class ResizeObserverMock {
    observe = vi.fn();

    unobserve = vi.fn();

    disconnect = vi.fn();
  }

  globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
}
