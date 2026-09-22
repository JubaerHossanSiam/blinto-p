import type { PortalRole } from '@/lib/access';
import { getPerson, people } from '@/lib/people';

export type RatingAuthorityDecision = {
  status: 'verified' | 'needs_validation' | 'invalid';
  reason: string;
};

const ifrat = getPerson('ifrat');

// Fazle's ClickUp identity is the top-level rating authority. The environment
// override keeps this configurable if the workspace identity ever changes.
export function ceoClickUpUserId() {
  return process.env.CLICKUP_CEO_USER_ID?.trim() || '3800999';
}

function personByClickUpId(clickupUserId: string) {
  return people.find((person) => person.clickupUserId === clickupUserId);
}

function managerProfile(employeeSlug: string) {
  const employee = getPerson(employeeSlug);
  if (!employee) return undefined;
  return people.find((person) => person.name.toLowerCase() === employee.manager.toLowerCase());
}

/**
 * `actorRole` is the rater's assigned portal role. Reviewer authority follows
 * that role rather than one hardcoded ClickUp identity, so a reviewer account
 * mapped to an ordinary employee slug still rates with full authority — and
 * its ratings stay attributed to that slug, which keeps the audit trail honest
 * about which account did the rating.
 */
export function decideRatingAuthority(
  employeeSlug: string,
  actorClickUpId: string,
  actorRole?: PortalRole,
): RatingAuthorityDecision {
  const employee = getPerson(employeeSlug);
  if (!employee) return { status: 'needs_validation', reason: 'Employee is not mapped in the performance framework.' };

  if (employee.clickupUserId === actorClickUpId) {
    return { status: 'invalid', reason: 'Self-rating is not valid performance evidence.' };
  }

  const ceoId = ceoClickUpUserId();
  if (ceoId && actorClickUpId === ceoId) {
    return { status: 'verified', reason: 'CEO rating authority.' };
  }

  // Explicit line-manager rules agreed for the first official cycle.
  if (employeeSlug === 'ifrat' || employeeSlug === 'rafsan') {
    return { status: 'needs_validation', reason: 'Only Fazle can finalize ratings for this line manager.' };
  }

  // The delivery reviewer rates the whole delivery org, employees and line
  // managers alike. This sits after the ifrat/rafsan check above, so the two
  // people only Fazle may finalize are already handled and are not reachable
  // here — including the reviewer rating themselves.
  if (actorRole === 'delivery_reviewer' || ifrat?.clickupUserId === actorClickUpId) {
    return { status: 'verified', reason: 'Delivery reviewer rating authority.' };
  }

  const manager = managerProfile(employeeSlug);
  if (manager?.clickupUserId === actorClickUpId) {
    return { status: 'verified', reason: 'Direct line manager rating.' };
  }

  const actor = personByClickUpId(actorClickUpId);
  return {
    status: 'needs_validation',
    reason: actor
      ? `${actor.name} is outside the normal rating authority for ${employee.name}; CEO/Admin validation is required.`
      : 'Reviewer is outside the mapped rating authority; CEO/Admin validation is required.',
  };
}
