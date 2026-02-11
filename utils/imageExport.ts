
/**
 * Utility functions for image manipulation
 * Note: Main logic is handled via 'html-to-image' in App.tsx
 */

export const formatFileName = (prefix: string) => {
  const date = new Date().toISOString().slice(0, 10);
  return `${prefix}-${date}.png`;
};
