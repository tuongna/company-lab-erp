import { UserRole } from '@companylab/contracts';

export interface AuthUser {
  id: string;
  legacyId: string | null;
  name: string;
  email: string;
  department: string;
  role: UserRole;
}
