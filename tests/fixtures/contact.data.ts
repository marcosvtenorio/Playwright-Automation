/**
 * Test data factories for contact form on automationintesting.online.
 *
 * Validation rules discovered from manual analysis:
 * - Name: required (non-blank)
 * - Email: required, must be well-formed email
 * - Phone: required, between 11 and 21 characters
 * - Subject: required, between 5 and 100 characters
 * - Message: required, between 20 and 2000 characters
 */

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

/** Generates a string of exact length by repeating a base text */
function repeatToLength(base: string, length: number): string {
  return base.repeat(Math.ceil(length / base.length)).substring(0, length);
}

/**
 * CT01 - Valid: Lower boundary limits (minimums)
 * Tests the smallest acceptable values for each field.
 */
export function createMinBoundaryContact(overrides?: Partial<ContactFormData>): ContactFormData {
  return {
    name: 'A',
    email: 'a@b.com',
    phone: '11999999999',          // 11 chars (minimum)
    subject: 'ABCDE',              // 5 chars (minimum)
    message: 'Exactly 20 chars ok!', // 20 chars (minimum)
    ...overrides,
  };
}

/**
 * CT02 - Valid: Upper boundary limits (maximums)
 * Tests the largest acceptable values for each field.
 */
export function createMaxBoundaryContact(overrides?: Partial<ContactFormData>): ContactFormData {
  return {
    name: 'Marcos',
    email: 'a@b.com',
    phone: '123456789012345678901',                    // 21 chars (maximum)
    subject: repeatToLength('Subject boundary test. ', 100),  // 100 chars (maximum)
    message: repeatToLength('Message boundary test with enough words to repeat cleanly. ', 2000), // 2000 chars (maximum)
    ...overrides,
  };
}

/**
 * CT03 - Valid: Nominal values (mid-range / happy path)
 * Tests standard, typical usage.
 */
export function createValidContact(overrides?: Partial<ContactFormData>): ContactFormData {
  return {
    name: 'Marcos Tenorio',
    email: 'marcos@teste.com',
    phone: '11999998888777',       // 14 chars (mid-range)
    subject: 'Assunto Padrão',
    message: 'Mensagem padrão válida com tamanho médio.',
    ...overrides,
  };
}

/**
 * CT04 - Invalid: All fields empty (required validation)
 * Submits everything empty to trigger all required-field errors.
 */
export function createEmptyContact(): ContactFormData {
  return {
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  };
}

/**
 * CT05 - Invalid: Below minimum + format errors (grouped)
 * Tests short values and malformed email simultaneously.
 * Name is valid intentionally — to verify it does NOT appear in errors.
 */
export function createBelowMinContact(): ContactFormData {
  return {
    name: 'Marcos',                // valid (no interference)
    email: 'email.sem.arroba',     // invalid format
    phone: '1234567890',           // 10 chars (below 11 minimum)
    subject: 'Oi',                 // 2 chars (below 5 minimum)
    message: 'Curto',              // 5 chars (below 20 minimum)
  };
}

/**
 * CT06 - Invalid: Above maximum (overflow)
 * Tests values that exceed the allowed limits.
 */
export function createAboveMaxContact(): ContactFormData {
  return {
    name: 'Marcos',                                    // valid
    email: 'a@b.com',                                  // valid
    phone: '1234567890123456789012',                   // 22 chars (above 21 maximum)
    subject: repeatToLength('Subject overflow test. ', 101),  // 101 chars (above 100 maximum)
    message: repeatToLength('Message overflow test with enough words to repeat cleanly. ', 2001), // 2001 chars (above 2000 maximum)
  };
}
