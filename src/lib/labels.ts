import type { Country, CourseStatus, InviteStatus, NewsStatus, Role } from '@prisma/client';

export const ROLE_LABEL: Record<Role, string> = { LEARNER: 'Learner', TEAM_LEAD: 'Team lead', ADMIN: 'Administrator' };
export const ROLES: Role[] = ['LEARNER', 'TEAM_LEAD', 'ADMIN'];

export const COURSE_STATUS_LABEL: Record<CourseStatus, string> = { DRAFT: 'Draft', PUBLISHED: 'Published', ARCHIVED: 'Archived' };
export const COURSE_STATUS_TONE: Record<CourseStatus, 'mint' | 'sand' | 'neutral'> = { PUBLISHED: 'mint', DRAFT: 'sand', ARCHIVED: 'neutral' };

export const NEWS_STATUS_LABEL: Record<NewsStatus, string> = { DRAFT: 'Draft', SCHEDULED: 'Scheduled', PUBLISHED: 'Published' };
export const NEWS_STATUS_TONE: Record<NewsStatus, 'mint' | 'sand' | 'gold'> = { PUBLISHED: 'mint', DRAFT: 'sand', SCHEDULED: 'gold' };

export const INVITE_STATUS_LABEL: Record<InviteStatus, string> = { PENDING: 'Pending', ACCEPTED: 'Accepted', EXPIRED: 'Expired', REVOKED: 'Revoked' };
export const INVITE_STATUS_TONE: Record<InviteStatus, 'sand' | 'mint' | 'neutral' | 'blush'> = { PENDING: 'sand', ACCEPTED: 'mint', EXPIRED: 'neutral', REVOKED: 'blush' };

export const COUNTRY_SHORT: Record<Country, string> = { Denmark: 'Denmark', Norway: 'Norway', Both: 'DK + NO' };
export const USER_COUNTRIES: Country[] = ['Denmark', 'Norway'];
export const CONTENT_COUNTRIES: Country[] = ['Both', 'Denmark', 'Norway'];

export const NEWS_CATEGORIES = ['Produksjon', 'Foto', 'Drone', 'Video', 'Sales', 'Kundeservice', 'Internt'];

/** Admin country scope: 'All' or one country. */
export type Scope = 'All' | 'Denmark' | 'Norway';
export function inScope(country: Country, scope: Scope): boolean {
  return scope === 'All' || country === 'Both' || country === scope;
}
/** Prisma where-fragment for content with a `country` column. */
export function scopeWhere(scope: Scope): { country?: { in: Country[] } } {
  return scope === 'All' ? {} : { country: { in: [scope, 'Both'] } };
}
