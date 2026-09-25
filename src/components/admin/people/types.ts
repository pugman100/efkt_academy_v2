import type { Country, Role, CourseStatus } from '@prisma/client';
import type { CourseLine } from './data';

export type { CourseLine };

export type GroupOption = { id: string; name: string; icon: string; inScope: number };
export type RegionOption = { id: string; name: string; country: Country };

export type UserRow = {
  id: string;
  name: string;
  email: string;
  role: Role;
  groupIds: string[];
  groups: string;
  country: Country;
  region: string;
  last: string;
  off: boolean;
  assigned: number;
  done: number;
  pct: number;
};

export type UserDetail = {
  id: string;
  name: string;
  email: string;
  jobTitle: string;
  role: Role;
  country: Country;
  regionId: string | null;
  active: boolean;
  groupIds: string[];
  last: string;
  joined: string;
  courses: CourseLine[];
  /** Directly assigned courses the learner can't see yet (draft, archived, other country). */
  hiddenDirect: { id: string; title: string; why: string }[];
  assignable: { id: string; title: string; status: CourseStatus }[];
  resetSent: string | null;
  isSelf: boolean;
  canImpersonate: boolean;
};

export type ActionResult = { ok: true } | { ok: false; error: string };
