export const MASK_PLACEHOLDER = '******';

export type SensitiveFieldDescriptor<T extends Record<string, unknown>> =
  | Extract<keyof T, string>
  | {
      field: Extract<keyof T, string>;
      mask?: (value: unknown, item: T) => unknown;
    };

export const maskSensitiveFields = <T extends Record<string, unknown>>(
  item: T,
  fields: SensitiveFieldDescriptor<T>[],
): T => {
  const clone = structuredClone(item);
  for (const descriptor of fields) {
    const field = typeof descriptor === 'string' ? descriptor : descriptor.field;
    if (!(field in clone)) continue;

    const originalValue = (item as Record<string, unknown>)[field];
    let masked: unknown = MASK_PLACEHOLDER;

    if (typeof descriptor !== 'string' && descriptor.mask) {
      const candidate = descriptor.mask(originalValue, item);
      masked = candidate ?? MASK_PLACEHOLDER;
    }

    (clone as Record<string, unknown>)[field] = masked;
  }
  return clone;
};
