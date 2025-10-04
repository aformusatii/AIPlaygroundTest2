export const MASK_PLACEHOLDER = '******';

export const maskSensitiveFields = <T extends Record<string, unknown>>(item: T, fields: string[]): T => {
  const clone = structuredClone(item);
  for (const field of fields) {
    if (field in clone) {
      (clone as Record<string, unknown>)[field] = MASK_PLACEHOLDER;
    }
  }
  return clone;
};
