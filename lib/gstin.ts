import type {GstinValidationResult} from './types';

const GSTIN_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

const STATE_CODES: Record<string, string> = {
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '22': 'Chhattisgarh',
  '23': 'Madhya Pradesh',
  '24': 'Gujarat',
  '27': 'Maharashtra',
  '29': 'Karnataka',
  '33': 'Tamil Nadu',
  '36': 'Telangana',
};

export function computeGstinChecksum(prefix14: string): string | null {
  const normalized = prefix14.trim().toUpperCase();
  if (normalized.length !== 14) return null;

  let sum = 0;
  for (let index = 0; index < 14; index += 1) {
    const codePoint = GSTIN_CHARS.indexOf(normalized[index]);
    if (codePoint < 0) return null;
    const factor = index % 2 === 0 ? 1 : 2;
    const product = codePoint * factor;
    sum += Math.floor(product / 36) + (product % 36);
  }
  const remainder = sum % 36;
  const checkIndex = (36 - remainder) % 36;
  return GSTIN_CHARS[checkIndex];
}

export function getStateName(code: string): string {
  return STATE_CODES[code] ?? `State Code ${code || 'Unknown'}`;
}

export function validateGstin(raw: string): GstinValidationResult {
  const normalized = raw.trim().toUpperCase();
  const stateCode = normalized.slice(0, 2);
  const stateName = getStateName(stateCode);
  const validFormat = GSTIN_REGEX.test(normalized);

  if (!validFormat) {
    return {
      validFormat: false,
      validChecksum: false,
      stateCode,
      stateName,
      isMadhyaPradesh: stateCode === '23',
    };
  }

  const expectedCheck = computeGstinChecksum(normalized.slice(0, 14));
  const validChecksum = expectedCheck === normalized[14];

  return {
    validFormat,
    validChecksum,
    stateCode,
    stateName,
    isMadhyaPradesh: stateCode === '23',
  };
}
