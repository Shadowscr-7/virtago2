'use client';

import { useGlobalErrorCatcher } from '@/hooks/useGlobalErrorCatcher';

/**
 * Client component that mounts the global error catcher hook.
 * Placed in the root layout to capture unhandled JS errors and promise rejections.
 */
export function GlobalErrorCatcherInit() {
  useGlobalErrorCatcher();
  return null;
}
