/**
 * Booking Lifecycle API Tests - Restful Booker
 *
 * Strategy:
 * - Test complete booking lifecycle: Create → Read → Update → Partial Update → Delete
 * - Validate integration between multiple endpoints
 * - Test health check endpoint
 * - Document status code bugs (POST returns 200 instead of 201, DELETE returns 201 instead of 204)
 *
 * Business Impact:
 * - Lifecycle tests validate end-to-end integration - critical for operational reliability
 * - Broken lifecycle = inability to manage bookings = operational failure
 *
 * API Behavior:
 * - POST /booking: Returns 200 (BUG: should be 201)
 * - GET /booking/:id: Returns 200
 * - PUT /booking/:id: Returns 200 (requires auth)
 * - PATCH /booking/:id: Returns 200 (requires auth)
 * - DELETE /booking/:id: Returns 201 (BUG: should be 204)
 * - GET /ping: Returns 201 (BUG: should be 200)
 */

import { test, expect } from '@playwright/test';
import { createValidBookingRequest } from '../fixtures/booking.data.js';
import { authenticateAdmin, deleteBooking } from './helpers/api-helper.js';
import {
  bookingCreateResponseSchema,
  bookingGetResponseSchema,
  bookingDetailsSchema,
} from './schemas/booking.schema.js';

test.describe('Booking Lifecycle API Tests', () => {
  test('LC01 - valid: should create, read, update, and delete booking', async ({ request }) => {

    // BUG: POST /booking returns 200 instead of 201 (RESTful standard)
    // Expected: 201 Created
    // Actual: 200 OK
    // This test documents the expected behavior (201) but will fail until API is fixed
    test.fail(true, 'BUG-001');
    
    // Arrange
    const bookingData = createValidBookingRequest();
    const createdBookings: number[] = [];
    let bookingId: number;

    // Step 1: Create booking
    const createResponse = await request.post('/booking', {
      data: bookingData,
    });
    
    expect(createResponse.status()).toBe(201);
    const createBody = await createResponse.json();
    bookingCreateResponseSchema.parse(createBody);
    bookingId = createBody.bookingid;
    createdBookings.push(bookingId);

    // Step 2: Get booking by ID
    const getResponse = await request.get(`/booking/${bookingId}`);
    expect(getResponse.status()).toBe(200);
    const getBody = await getResponse.json();
    bookingGetResponseSchema.parse(getBody);
    expect(getBody.firstname).toBe(bookingData.firstname);

    // Step 3: Authenticate for update operations
    const token = await authenticateAdmin(request);
    expect(token).not.toBeNull();
    const authHeaders = { Cookie: `token=${token}` };

    // Step 4: Update booking (PUT)
    const updateData = {
      ...bookingData,
      firstname: 'Updated',
      totalprice: 222,
    };
    const putResponse = await request.put(`/booking/${bookingId}`, {
      headers: authHeaders,
      data: updateData,
    });
    expect(putResponse.status()).toBe(200);
    const putBody = await putResponse.json();
    bookingDetailsSchema.parse(putBody);
    expect(putBody.firstname).toBe('Updated');
    expect(putBody.totalprice).toBe(222);

    // Step 5: Partial update booking (PATCH)
    const patchData = {
      firstname: 'Patched',
    };
    const patchResponse = await request.patch(`/booking/${bookingId}`, {
      headers: authHeaders,
      data: patchData,
    });
    expect(patchResponse.status()).toBe(200);
    const patchBody = await patchResponse.json();
    bookingDetailsSchema.parse(patchBody);
    expect(patchBody.firstname).toBe('Patched');
    // Other fields should remain unchanged
    expect(patchBody.totalprice).toBe(222);

    // Step 6: Delete booking
    // BUG: DELETE /booking/:id returns 201 instead of 204 (RESTful standard)
    // Expected: 204 No Content
    // Actual: 201 Created
    // This test documents the expected behavior (204) but will fail until API is fixed
    
    const deleteResponse = await request.delete(`/booking/${bookingId}`, {
      headers: authHeaders,
    });
    
    // Assert - Expected behavior (204 No Content)
    expect(deleteResponse.status()).toBe(204);
    
    // After deletion, GET should return 404
    const getAfterDeleteResponse = await request.get(`/booking/${bookingId}`);
    expect(getAfterDeleteResponse.status()).toBe(404);

    // Cleanup (best-effort, in case DELETE fails)
    await deleteBooking(request, bookingId);
  });

  test('LC02 - valid: should ping health check endpoint', async ({ request }) => {
    // BUG: GET /ping returns 201 instead of 200
    // Expected: 200 OK (RESTful standard for GET requests)
    // Actual: 201 Created
    // This test documents the expected behavior (200) but will fail until API is fixed
    test.fail(true, 'BUG-008');
    
    // Arrange & Act
    const response = await request.get('/ping');

    // Assert - Expected behavior (200 OK)
    expect(response.status()).toBe(200);
    
    const text = await response.text();
    expect(text).toBe('Created');
  });
});
