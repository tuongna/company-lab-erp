import { isUUID } from 'class-validator';

/**
 * Returns true if the string is a valid UUID
 */
export function isValidUUID(id: string): boolean {
  return isUUID(id);
}

/**
 * Returns a TypeORM where condition that searches by UUID id or legacyId.
 * If the input is not a valid UUID, searches only by legacyId to prevent Postgres 22P02 error.
 */
export function byIdOrLegacyId(
  idOrLegacyId: string,
): { id: string } | { legacyId: string } | Array<{ id: string } | { legacyId: string }> {
  return isValidUUID(idOrLegacyId)
    ? [{ id: idOrLegacyId }, { legacyId: idOrLegacyId }]
    : { legacyId: idOrLegacyId };
}
