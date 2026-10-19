import { isValidUUID, byIdOrLegacyId } from './identifier.util';

describe('identifier.util', () => {
  describe('isValidUUID', () => {
    it('should return true for valid UUID v4', () => {
      expect(isValidUUID('c8801ceb-d54e-4e49-8c2d-ae2bb97f8c14')).toBe(true);
    });

    it('should return false for legacy id or arbitrary string', () => {
      expect(isValidUUID('REQ-001')).toBe(false);
      expect(isValidUUID('AST-100')).toBe(false);
      expect(isValidUUID('')).toBe(false);
    });
  });

  describe('byIdOrLegacyId', () => {
    it('should return array condition with id and legacyId when input is a valid UUID', () => {
      const uuid = 'c8801ceb-d54e-4e49-8c2d-ae2bb97f8c14';
      const result = byIdOrLegacyId(uuid);
      expect(result).toEqual([{ id: uuid }, { legacyId: uuid }]);
    });

    it('should return single legacyId condition when input is not a UUID', () => {
      const legacyId = 'REQ-001';
      const result = byIdOrLegacyId(legacyId);
      expect(result).toEqual({ legacyId: 'REQ-001' });
    });
  });
});
