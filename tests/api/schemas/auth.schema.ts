/**
 * Authentication Schemas
 *
 * Zod schemas for Restful Booker API authentication endpoints
 */

import { z } from 'zod';

/**
 * POST /auth — request schema
 */
export const authRequestSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

/**
 * POST /auth → 200 — success response schema
 */
export const authResponseSchema = z.object({
  token: z.string().min(1),
});

/**
 * POST /auth → 200 — error response schema (invalid credentials)
 */
export const authErrorSchema = z.object({
  reason: z.string(),
});

