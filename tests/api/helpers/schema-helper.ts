/**
 * Schema Validation Helper
 *
 * Utility function for Zod schema validation when you need to handle errors without throwing.
 * For assertions in tests, use schema.parse() directly - Zod provides excellent error messages.
 */

import { z } from 'zod';

/**
 * Validate data against a Zod schema without throwing.
 * Use this when you need to check validation without failing the test immediately.
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validation result with success flag and errors
 */
export function validateSchema<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: z.ZodError;
} {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, errors: result.error };
  }
}

