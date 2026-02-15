/**
 * Booking API Types
 *
 * Interfaces derived from empirical API testing via Playwright MCP.
 * All field boundaries confirmed through boundary value analysis.
 */

// ─── Room Types ────────────────────────────────────────────

export interface Room {
  roomid: number;
  roomName: string;
  type: string;
  accessible: boolean;
  image: string;
  description: string;
  features: string[];
  roomPrice: number;
}

export interface RoomListResponse {
  rooms: Room[];
}

// ─── Booking Types ─────────────────────────────────────────

export interface BookingDates {
  checkin: string;  // YYYY-MM-DD
  checkout: string; // YYYY-MM-DD
}

/** POST /api/booking — request payload */
export interface BookingRequest {
  roomid: number;
  firstname: string;   // 3-18 chars
  lastname: string;    // 3-30 chars
  email: string;       // well-formed email
  phone: string;       // 11-21 chars
  depositpaid: boolean;
  bookingdates: BookingDates;
}

/** POST /api/booking → 201 — success response */
export interface BookingResponse {
  bookingid: number;
  roomid: number;
  firstname: string;
  lastname: string;
  depositpaid: boolean;
  bookingdates: BookingDates;
  // Note: email and phone are NOT returned by the API
}

/** POST /api/booking → 400 — validation error response */
export interface BookingValidationError {
  errors: string[];
}

/** POST /api/booking → 409 — conflict error response */
export interface BookingConflictError {
  error: string; // "Failed to create booking"
}

// ─── Report Types ──────────────────────────────────────────

export interface UnavailableDateRange {
  start: string;  // YYYY-MM-DD
  end: string;    // YYYY-MM-DD
  title: 'Unavailable';
}

/** GET /api/report/room/:id — unavailable dates for a room */
export type RoomAvailabilityReport = UnavailableDateRange[];

// ─── Branding Types ────────────────────────────────────────

export interface BrandingContact {
  name: string;
  phone: string;
  email: string;
}

export interface BrandingAddress {
  line1: string;
  line2: string;
  postTown: string;
  county: string;
  postCode: string;
}

export interface BrandingMap {
  latitude: number;
  longitude: number;
}

/** GET /api/branding — site branding and contact info */
export interface BrandingResponse {
  name: string;
  map: BrandingMap;
  logoUrl: string;
  description: string;
  directions: string;
  contact: BrandingContact;
  address: BrandingAddress;
}
