import { vi } from 'vitest';

Object.assign(window, {
  navigator: {
    ...window.navigator,
    clipboard: {
      writeText: vi.fn().mockResolvedValue(undefined),
    },
  },
});

if (!window.matchMedia) {
  window.matchMedia = () => ({
    matches: false,
    media: '',
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }) as unknown as typeof window.matchMedia;
}
