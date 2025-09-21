// polyfills.ts - Simple Buffer polyfill for Privy

import { Buffer } from 'buffer'

// Make Buffer globally available for Privy
if (typeof window !== 'undefined') {
  window.Buffer = Buffer
  window.global = window.global || window
}

// Also make it available on globalThis
if (typeof globalThis !== 'undefined') {
  globalThis.Buffer = Buffer
  globalThis.global = globalThis.global || globalThis
}

export { Buffer }