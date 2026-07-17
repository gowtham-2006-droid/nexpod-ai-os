const isDev = process.env.NODE_ENV === 'development';

/**
 * Safe logger that gates output based on the environment to ensure no debug/error clutter in production console logs.
 */
export const logger = {
  error: (...args: unknown[]) => {
    if (isDev) {
      console.error(...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (isDev) {
      console.warn(...args);
    }
  },
  info: (...args: unknown[]) => {
    if (isDev) {
      console.info(...args);
    }
  }
};
