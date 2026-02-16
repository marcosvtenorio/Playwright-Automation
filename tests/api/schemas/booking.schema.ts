/**
 * Booking Schemas
 *
 * Zod schemas for Restful Booker API booking endpoints
 */

import { z } from 'zod';

/**
 * Booking dates schema
 */
export const bookingDatesSchema = z.object({
  checkin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  checkout: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
});

/**
 * POST /booking — request schema
 */
export const bookingRequestSchema = z.object({
  firstname: z.string().min(1),
  lastname: z.string().min(1),
  totalprice: z.number().int().min(0),
  depositpaid: z.boolean(),
  bookingdates: bookingDatesSchema,
  additionalneeds: z.string().optional(),
});

/**
 * Booking details schema (used in GET /booking/:id and POST response)
 */
export const bookingDetailsSchema = z.object({
  firstname: z.string(),
  lastname: z.string(),
  totalprice: z.number(),
  depositpaid: z.boolean(),
  bookingdates: bookingDatesSchema,
  additionalneeds: z.string().optional(),
});

/**
 * POST /booking → 200 — success response schema
 */
export const bookingCreateResponseSchema = z.object({
  bookingid: z.number().int().positive(),
  booking: bookingDetailsSchema,
});

/**
 * GET /booking/:id → 200 — response schema
 */
export const bookingGetResponseSchema = bookingDetailsSchema;

/**
 * PUT /booking/:id — request schema (same as bookingRequestSchema)
 */
export const bookingUpdateRequestSchema = bookingRequestSchema;

/**
 * PATCH /booking/:id — partial update request schema
 */
export const bookingPartialUpdateSchema = bookingRequestSchema.partial();

/**
 * Error response schemas
 */
export const bookingErrorSchema = z.object({
  error: z.string().optional(),
  reason: z.string().optional(),
}).passthrough();
