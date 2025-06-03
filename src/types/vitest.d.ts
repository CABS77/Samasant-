/// <reference types="vitest" />

import type { Assertion, AsymmetricMatchersContaining } from 'vitest';

interface CustomMatchers<R = unknown> {
  toBeInTheDocument(): R;
  toHaveBeenCalledWith(...args: any[]): R;
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}

// Déclaration globale pour SpeechRecognition
interface Window {
  SpeechRecognition: any;
  webkitSpeechRecognition: any;
}
