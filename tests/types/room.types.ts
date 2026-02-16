/**
 * Room Management Types
 *
 * Types for admin room creation and management.
 * Used by fixtures and Page Objects to ensure type consistency.
 *
 * NOTE: type field is string (not union type) to allow backend flexibility
 * for future room types without breaking existing code.
 */

export interface RoomFormData {
  roomNumber: string;
  type: string; // Valid values: 'Single', 'Twin', 'Double', 'Family', 'Suite' (flexible for future types)
  accessible: boolean;
  price: string;
  features?: string[];
}

