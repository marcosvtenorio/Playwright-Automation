/**
 * Room Fixtures
 *
 * Test data factories for admin room management on automationintesting.online.
 *
 * Validation rules discovered via MCP exploration:
 * - Room number: required (must be set)
 * - Price: required, must be >= 1
 * - Type: Single, Twin, Double, Family, Suite
 * - Accessible: true/false
 * - Features: WiFi, TV, Radio, Refreshments, Safe, Views (optional checkboxes)
 */

export interface RoomFormData {
  roomNumber: string;
  type: 'Single' | 'Twin' | 'Double' | 'Family' | 'Suite';
  accessible: boolean;
  price: string;
  features?: string[];
}

/**
 * Generates a unique room number based on timestamp.
 * Format: 999X where X is last 3-4 digits of timestamp.
 * This ensures uniqueness across test runs.
 */
function generateUniqueRoomNumber(): string {
  return `999${Date.now()}`.slice(-4);
}

// ─── Valid Fixtures ────────────────────────────────────────

/**
 * AD06 - Valid: Happy path room with all fields valid
 * Creates a room with typical values for testing successful creation.
 */
export function createValidRoom(overrides?: Partial<RoomFormData>): RoomFormData {
  return {
    roomNumber: generateUniqueRoomNumber(), // Unique room number
    type: 'Single',
    accessible: true,
    price: '150', // Valid price >= 1
    features: ['WiFi', 'TV', 'Safe'],
    ...overrides,
  };
}

/**
 * Valid: Room with minimum price boundary
 * Tests the minimum valid price (1).
 */
export function createMinPriceRoom(overrides?: Partial<RoomFormData>): RoomFormData {
  return {
    roomNumber: generateUniqueRoomNumber(),
    type: 'Single',
    accessible: true,
    price: '1', // Minimum valid price
    features: ['WiFi'],
    ...overrides,
  };
}

/**
 * Valid: Room with all features selected
 * Tests room creation with maximum feature selection.
 */
export function createFullFeaturesRoom(overrides?: Partial<RoomFormData>): RoomFormData {
  return {
    roomNumber: generateUniqueRoomNumber(),
    type: 'Suite',
    accessible: true,
    price: '250',
    features: ['WiFi', 'TV', 'Radio', 'Refreshments', 'Safe', 'Views'], // All features
    ...overrides,
  };
}

/**
 * Valid: Accessible room
 * Tests room creation with accessible flag set to true.
 */
export function createAccessibleRoom(overrides?: Partial<RoomFormData>): RoomFormData {
  return {
    roomNumber: generateUniqueRoomNumber(),
    type: 'Double',
    accessible: true,
    price: '200',
    features: ['WiFi', 'TV', 'Safe'],
    ...overrides,
  };
}

/**
 * Valid: Non-accessible room
 * Tests room creation with accessible flag set to false.
 */
export function createNonAccessibleRoom(overrides?: Partial<RoomFormData>): RoomFormData {
  return {
    roomNumber: generateUniqueRoomNumber(),
    type: 'Twin',
    accessible: false,
    price: '120',
    features: ['WiFi'],
    ...overrides,
  };
}

// ─── Invalid Fixtures ────────────────────────────────────────

/**
 * AD13 - Invalid: Empty room data
 * All fields empty to trigger validation errors.
 * Expected errors: "Room name must be set", "must be greater than or equal to 1"
 */
export function createEmptyRoom(): RoomFormData {
  return {
    roomNumber: '', // Empty - triggers "Room name must be set"
    type: 'Single',
    accessible: false,
    price: '', // Empty - triggers price validation
    features: [],
  };
}

/**
 * AD14 - Invalid: Room with zero price
 * Price set to zero to trigger validation error.
 * Expected error: "must be greater than or equal to 1"
 */
export function createZeroPriceRoom(overrides?: Partial<RoomFormData>): RoomFormData {
  return {
    roomNumber: '9999',
    type: 'Single',
    accessible: true,
    price: '0', // Invalid: must be >= 1
    features: ['WiFi'],
    ...overrides,
  };
}

/**
 * AD15 - Invalid: Room with empty room number
 * Room number empty but other fields valid.
 * Expected error: "Room name must be set"
 */
export function createEmptyRoomNumberRoom(overrides?: Partial<RoomFormData>): RoomFormData {
  return {
    roomNumber: '', // Empty - triggers "Room name must be set"
    type: 'Single',
    accessible: true,
    price: '150',
    features: ['WiFi'],
    ...overrides,
  };
}

/**
 * Invalid: Room with negative price (if app accepts string)
 * Tests negative price validation.
 */
export function createNegativePriceRoom(overrides?: Partial<RoomFormData>): RoomFormData {
  return {
    roomNumber: '9999',
    type: 'Single',
    accessible: true,
    price: '-10', // Invalid: negative price
    features: ['WiFi'],
    ...overrides,
  };
}

