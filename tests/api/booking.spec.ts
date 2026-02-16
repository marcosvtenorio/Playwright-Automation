/**
 * Booking API Tests - Restful Booker
 *
 * Strategy:
 * - Test CRUD operations for bookings (Create, Read)
 * - Boundary Value Analysis (BVA) on booking creation
 * - Validate error handling for invalid data
 * - Note: POST /booking is returning 200 instead of 201 (RESTful standard), DELETE is returning 201 instead of 204 (RESTful standard)
 * - Response structure: POST returns {bookingid, booking: {...}}
 *
 * Business Impact:
 * - Bookings are the core revenue flow - broken booking API = lost revenue
 * - Invalid bookings can cause data corruption and operational issues
 *
 */

import { test, expect } from '@playwright/test';
import {
  createValidBookingRequest,
  createMinBoundaryBookingRequest,
  createMaxBoundaryBookingRequest,
  createInvalidBookingRequest,
} from '../fixtures/booking.data.js';
import { deleteBooking, getBookingById, authenticateAdmin } from './helpers/api-helper.js';
import {
  bookingCreateResponseSchema,
  bookingGetResponseSchema,
  bookingDetailsSchema,
} from './schemas/booking.schema.js';
import { BOOKING_ERROR_MESSAGES, validateErrorMessage } from './constants/error-messages.js';

test.describe('Booking API Tests', () => {
  test('BK01 - valid: should create booking with valid data', async ({ request }) => {
    // BUG: Restful Booker API returns 200 instead of 201 for POST /booking
    // Expected: 201 Created
    // Actual: 200 OK
    // This test documents the expected behavior (201) but will fail until API is fixed
    test.fail(true, 'BUG-001');
    
    // Arrange
    const bookingData = createValidBookingRequest();

    // Act
    const response = await request.post('/booking', {
      data: bookingData,
    });

    // Assert - Expected behavior (201 Created)
    expect(response.status()).toBe(201); // RESTful standard for resource creation
    
    const body = await response.json();
    bookingCreateResponseSchema.parse(body); // Zod validation
    
    expect(body.bookingid).toBeGreaterThan(0);
    expect(body.booking.firstname).toBe(bookingData.firstname);
    expect(body.booking.lastname).toBe(bookingData.lastname);
    expect(body.booking.totalprice).toBe(bookingData.totalprice);
    expect(body.booking.depositpaid).toBe(bookingData.depositpaid);
    expect(body.booking.bookingdates.checkin).toBe(bookingData.bookingdates.checkin);
    expect(body.booking.bookingdates.checkout).toBe(bookingData.bookingdates.checkout);

    // Cleanup
    await deleteBooking(request, body.bookingid);
  });

  test('BK02 - valid: should create booking with minimum boundary values', async ({ request }) => {
    // BUG: Restful Booker API returns 200 instead of 201 for POST /booking
    // Expected: 201 Created (RESTful standard)
    // Actual: 200 OK
    // This test documents the expected behavior (201) but will fail until API is fixed
    test.fail(true, 'BUG-001');
    
    // Arrange
    const bookingData = createMinBoundaryBookingRequest();
    // Act
    const response = await request.post('/booking', {
      data: bookingData,
    });

    // Assert - Expected behavior (201 Created)
    expect(response.status()).toBe(201); // RESTful standard for resource creation
    
    const body = await response.json();
    bookingCreateResponseSchema.parse(body);
    
    expect(body.bookingid).toBeGreaterThan(0);
    expect(body.booking.totalprice).toBe(bookingData.totalprice);
    
    // Cleanup
    await deleteBooking(request, body.bookingid);
  });

  test('BK03 - valid: should create booking with maximum boundary values', async ({ request }) => {
    // BUG: Restful Booker API returns 200 instead of 201 for POST /booking
    // Expected: 201 Created (RESTful standard)
    // Actual: 200 OK
    // This test documents the expected behavior (201) but will fail until API is fixed
    test.fail(true, 'BUG-001');
    
    // Arrange
    const bookingData = createMaxBoundaryBookingRequest();

    // Act
    const response = await request.post('/booking', {
      data: bookingData,
    });

    // Assert - Expected behavior (201 Created)
    expect(response.status()).toBe(201); // RESTful standard for resource creation
    
    const body = await response.json();
    bookingCreateResponseSchema.parse(body);
    
    expect(body.bookingid).toBeGreaterThan(0);
    expect(body.booking.totalprice).toBe(bookingData.totalprice);

    // Cleanup
    await deleteBooking(request, body.bookingid);
  });

  test('BK04 - invalid: should reject booking with empty required fields', async ({ request }) => {
    // BUG: Restful Booker API accepts empty fields and returns 200
    // Expected: 400 Bad Request
    // Actual: 200 OK (creates booking with empty firstname/lastname)
    // This test documents the expected behavior (400) but will fail until API is fixed
    test.fail(true, 'BUG-002');
    
    // Arrange
    const bookingData = createInvalidBookingRequest('emptyFields');

    // Act
    const response = await request.post('/booking', {
      data: bookingData,
    });

    // Assert - Expected behavior (400 Bad Request)
    expect(response.status()).toBe(400);
    
    const body = await response.json();
    expect(body).toHaveProperty('error');
    expect(typeof body.error).toBe('string');
    expect(body.error.length).toBeGreaterThan(0);
    // Validate exact error message when API is fixed
    const expectedMessages = [
      BOOKING_ERROR_MESSAGES.FIRSTNAME_REQUIRED,
      BOOKING_ERROR_MESSAGES.LASTNAME_REQUIRED,
      BOOKING_ERROR_MESSAGES.REQUIRED_FIELDS_MISSING,
    ];
    expect(validateErrorMessage(body.error, expectedMessages)).toBe(true);
    // When API is fixed, uncomment for exact validation:
    // expect(body.error).toBe(BOOKING_ERROR_MESSAGES.FIRSTNAME_REQUIRED);
  });

  test('BK05 - invalid: should reject booking with negative totalprice', async ({ request }) => {
    // BUG: Restful Booker API accepts negative totalprice and returns 200
    // Expected: 400 Bad Request
    // Actual: 200 OK (creates booking with negative price)
    // This test documents the expected behavior (400) but will fail until API is fixed
    test.fail(true, 'BUG-003');
    
    // Arrange
    const bookingData = createInvalidBookingRequest('negativePrice');

    // Act
    const response = await request.post('/booking', {
      data: bookingData,
    });

    // Assert - Expected behavior (400 Bad Request)
    expect(response.status()).toBe(400);
    
    const body = await response.json();
    expect(body).toHaveProperty('error');
    expect(typeof body.error).toBe('string');
    expect(body.error.length).toBeGreaterThan(0);
    // Validate exact error message when API is fixed
    const expectedMessages = [
      BOOKING_ERROR_MESSAGES.PRICE_NEGATIVE,
      BOOKING_ERROR_MESSAGES.PRICE_INVALID,
    ];
    expect(validateErrorMessage(body.error, expectedMessages)).toBe(true);
    // When API is fixed, uncomment for exact validation:
    // expect(body.error).toBe(BOOKING_ERROR_MESSAGES.PRICE_NEGATIVE);
  });

  test('BK06 - invalid: should reject booking with invalid dates (checkout < checkin)', async ({ request }) => {
    // BUG: Restful Booker API accepts invalid dates (checkout < checkin) and returns 200
    // Expected: 400 Bad Request
    // Actual: 200 OK (creates booking with invalid date range)
    // This test documents the expected behavior (400) but will fail until API is fixed
    test.fail(true, 'BUG-004');
    
    // Arrange
    const bookingData = createInvalidBookingRequest('invalidDates');

    // Act
    const response = await request.post('/booking', {
      data: bookingData,
    });

    // Assert - Expected behavior (400 Bad Request)
    expect(response.status()).toBe(400);
    
    const body = await response.json();
    expect(body).toHaveProperty('error');
    expect(typeof body.error).toBe('string');
    expect(body.error.length).toBeGreaterThan(0);
    // Validate exact error message when API is fixed
    const expectedMessages = [
      BOOKING_ERROR_MESSAGES.DATES_INVALID,
      BOOKING_ERROR_MESSAGES.DATE_RANGE_INVALID,
    ];
    expect(validateErrorMessage(body.error, expectedMessages)).toBe(true);
    // When API is fixed, uncomment for exact validation:
    // expect(body.error).toBe(BOOKING_ERROR_MESSAGES.DATES_INVALID);
  });

  test('BK07 - valid: should retrieve booking by ID after creation', async ({ request }) => {
    // Arrange
    const bookingData = createValidBookingRequest();

    // Create booking first
    // BUG: POST /booking returns 200 instead of 201 (RESTful standard)
    // Expected: 201 Created
    // Actual: 200 OK
    const createResponse = await request.post('/booking', {
      data: bookingData,
    });
    
    // Accepting actual behavior for this test (200) since we need to continue the flow
    expect(createResponse.status()).toBe(200);
    const createBody = await createResponse.json();
    const bookingId = createBody.bookingid;

    // Act - Get booking by ID
    const getResponse = await request.get(`/booking/${bookingId}`);

    // Assert
    expect(getResponse.status()).toBe(200);
    
    const body = await getResponse.json();
    bookingGetResponseSchema.parse(body);
    
    // Note: GET /booking/:id does NOT return bookingid in the object
    expect(body.firstname).toBe(bookingData.firstname);
    expect(body.lastname).toBe(bookingData.lastname);
    expect(body.totalprice).toBe(bookingData.totalprice);
    expect(body.depositpaid).toBe(bookingData.depositpaid);
    expect(body.bookingdates.checkin).toBe(bookingData.bookingdates.checkin);
    expect(body.bookingdates.checkout).toBe(bookingData.bookingdates.checkout);

    // Cleanup
    await deleteBooking(request, bookingId);
  });

  test('BK08 - valid: should list all bookings', async ({ request }) => {
    // Arrange & Act
    const response = await request.get('/booking');

    // Assert
    expect(response.status()).toBe(200);
    
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    // Note: Array may be empty in clean environments
    // Only validate structure if bookings exist
    
    // Verify structure of first booking if available
    if (body.length > 0) {
      const firstBooking = body[0];
      expect(firstBooking).toHaveProperty('bookingid');
      expect(typeof firstBooking.bookingid).toBe('number');
      expect(firstBooking.bookingid).toBeGreaterThan(0);
    }
  });

  test('BK09 - valid: should update booking with PUT', async ({ request }) => {
    // Arrange
    const bookingData = createValidBookingRequest();

    // Create booking first
    const createResponse = await request.post('/booking', {
      data: bookingData,
    });
    expect(createResponse.status()).toBe(200);
    const createBody = await createResponse.json();
    const bookingId = createBody.bookingid;

    // Authenticate for update operation
    const token = await authenticateAdmin(request);
    expect(token).not.toBeNull();
    const authHeaders = { Cookie: `token=${token}` };

    // Prepare update data
    const updateData = {
      ...bookingData,
      firstname: 'Updated',
      lastname: 'Name',
      totalprice: 222,
    };

    // Act
    const response = await request.put(`/booking/${bookingId}`, {
      headers: authHeaders,
      data: updateData,
    });

    // Assert
    expect(response.status()).toBe(200);
    
    const body = await response.json();
    bookingDetailsSchema.parse(body);
    
    expect(body.firstname).toBe('Updated');
    expect(body.lastname).toBe('Name');
    expect(body.totalprice).toBe(222);
    expect(body.depositpaid).toBe(bookingData.depositpaid);
    expect(body.bookingdates.checkin).toBe(bookingData.bookingdates.checkin);
    expect(body.bookingdates.checkout).toBe(bookingData.bookingdates.checkout);

    // Cleanup
    await deleteBooking(request, bookingId);
  });

  test('BK10 - valid: should partially update booking with PATCH', async ({ request }) => {
    // Arrange
    const bookingData = createValidBookingRequest();

    // Create booking first
    const createResponse = await request.post('/booking', {
      data: bookingData,
    });
    expect(createResponse.status()).toBe(200);
    const createBody = await createResponse.json();
    const bookingId = createBody.bookingid;

    // Authenticate for update operation
    const token = await authenticateAdmin(request);
    expect(token).not.toBeNull();
    const authHeaders = { Cookie: `token=${token}` };

    // Prepare partial update data (only firstname)
    const patchData = {
      firstname: 'Patched',
    };

    // Act
    const response = await request.patch(`/booking/${bookingId}`, {
      headers: authHeaders,
      data: patchData,
    });

    // Assert
    expect(response.status()).toBe(200);
    
    const body = await response.json();
    bookingDetailsSchema.parse(body);
    
    // Patched field should be updated
    expect(body.firstname).toBe('Patched');
    
    // Other fields should remain unchanged
    expect(body.lastname).toBe(bookingData.lastname);
    expect(body.totalprice).toBe(bookingData.totalprice);
    expect(body.depositpaid).toBe(bookingData.depositpaid);
    expect(body.bookingdates.checkin).toBe(bookingData.bookingdates.checkin);
    expect(body.bookingdates.checkout).toBe(bookingData.bookingdates.checkout);

    // Cleanup
    await deleteBooking(request, bookingId);
  });

  test('BK11 - invalid: should reject PUT with invalid data', async ({ request }) => {
    // BUG: Restful Booker API accepts invalid data in PUT and returns 200
    // Expected: 400 Bad Request
    // Actual: 200 OK (updates booking with invalid data)
    // This test documents the expected behavior (400) but will fail until API is fixed
    test.fail(true, 'BUG-005');
    
    // Arrange
    const bookingData = createValidBookingRequest();

    // Create booking first
    const createResponse = await request.post('/booking', {
      data: bookingData,
    });
    expect(createResponse.status()).toBe(200);
    const createBody = await createResponse.json();
    const bookingId = createBody.bookingid;

    // Authenticate for update operation
    const token = await authenticateAdmin(request);
    expect(token).not.toBeNull();
    const authHeaders = { Cookie: `token=${token}` };

    // Prepare invalid update data (negative price)
    const invalidUpdateData = {
      ...bookingData,
      totalprice: -1, // Invalid: negative price
    };

    // Act
    const response = await request.put(`/booking/${bookingId}`, {
      headers: authHeaders,
      data: invalidUpdateData,
    });

    // Assert - Expected behavior (400 Bad Request)
    expect(response.status()).toBe(400);
    
    const body = await response.json();
    expect(body).toHaveProperty('error');
    expect(typeof body.error).toBe('string');
    expect(body.error.length).toBeGreaterThan(0);
    // Validate exact error message when API is fixed
    const expectedMessages = [
      BOOKING_ERROR_MESSAGES.PRICE_NEGATIVE,
      BOOKING_ERROR_MESSAGES.PRICE_INVALID,
    ];
    expect(validateErrorMessage(body.error, expectedMessages)).toBe(true);
    // When API is fixed, uncomment for exact validation:
    // expect(body.error).toBe(BOOKING_ERROR_MESSAGES.PRICE_NEGATIVE);

    // Cleanup
    await deleteBooking(request, bookingId);
  });

  test('BK12 - invalid: should reject PATCH with invalid data', async ({ request }) => {
    // BUG: Restful Booker API accepts invalid data in PATCH and returns 200
    // Expected: 400 Bad Request
    // Actual: 200 OK (updates booking with invalid data)
    // This test documents the expected behavior (400) but will fail until API is fixed
    test.fail(true, 'BUG-006');
    
    // Arrange
    const bookingData = createValidBookingRequest();

    // Create booking first
    const createResponse = await request.post('/booking', {
      data: bookingData,
    });
    expect(createResponse.status()).toBe(200);
    const createBody = await createResponse.json();
    const bookingId = createBody.bookingid;

    // Authenticate for update operation
    const token = await authenticateAdmin(request);
    expect(token).not.toBeNull();
    const authHeaders = { Cookie: `token=${token}` };

    // Prepare invalid partial update data (empty firstname)
    const invalidPatchData = {
      firstname: '', // Invalid: empty required field
    };

    // Act
    const response = await request.patch(`/booking/${bookingId}`, {
      headers: authHeaders,
      data: invalidPatchData,
    });

    // Assert - Expected behavior (400 Bad Request)
    expect(response.status()).toBe(400);
    
    const body = await response.json();
    expect(body).toHaveProperty('error');
    expect(typeof body.error).toBe('string');
    expect(body.error.length).toBeGreaterThan(0);
    // Validate exact error message when API is fixed
    const expectedMessages = [
      BOOKING_ERROR_MESSAGES.FIRSTNAME_REQUIRED,
      BOOKING_ERROR_MESSAGES.REQUIRED_FIELDS_MISSING,
    ];
    expect(validateErrorMessage(body.error, expectedMessages)).toBe(true);
    // When API is fixed, uncomment for exact validation:
    // expect(body.error).toBe(BOOKING_ERROR_MESSAGES.FIRSTNAME_REQUIRED);

    // Cleanup
    await deleteBooking(request, bookingId);
  });

  test('BK13 - valid: should retrieve booking by ID', async ({ request }) => {
    // Arrange
    const bookingData = createValidBookingRequest();

    // Create booking first
    // BUG: POST /booking returns 200 instead of 201 (RESTful standard)
    // Expected: 201 Created
    // Actual: 200 OK
    const createResponse = await request.post('/booking', {
      data: bookingData,
    });
    
    // Accepting actual behavior for this test (200) since we need to continue the flow
    expect(createResponse.status()).toBe(200);
    const createBody = await createResponse.json();
    const bookingId = createBody.bookingid;

    // Act - Use helper function to retrieve booking
    const retrievedBooking = await getBookingById(request, bookingId);

    // Assert
    expect(retrievedBooking).not.toBeNull();
    
    // Validate structure matches expected booking
    if (retrievedBooking && typeof retrievedBooking === 'object') {
      const booking = retrievedBooking as Record<string, unknown>;
      expect(booking).toHaveProperty('firstname');
      expect(booking).toHaveProperty('lastname');
      expect(booking).toHaveProperty('totalprice');
      expect(booking.firstname).toBe(bookingData.firstname);
      expect(booking.lastname).toBe(bookingData.lastname);
      expect(booking.totalprice).toBe(bookingData.totalprice);
    }

    // Act - Test with non-existent ID
    const nonExistentBooking = await getBookingById(request, 999999);

    // Assert - Should return null for non-existent booking
    expect(nonExistentBooking).toBeNull();

    // Cleanup
    await deleteBooking(request, bookingId);
  });
});

