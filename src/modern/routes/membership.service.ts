import type { Membership, MembershipPeriod } from "./membership.routes";

const { v4: uuidv4 } = require("uuid");
const memberships = require("../../data/memberships.json") as Membership[];
const membershipPeriods =
	require("../../data/membership-periods.json") as MembershipPeriod[];
const DAYS_IN_WEEK = 7;
const MONTH_IN_YEAR = 12;
/**
 * Calculates the expiration date for a membership based on the start date and billing configuration.
 *
 * @param validFrom - The start date of the membership validity period
 * @param billingPeriods - The number of billing periods to add to the start date
 * @param billingInterval - The type of billing interval ("monthly", "yearly", or "weekly")
 * @returns The calculated expiration date for the membership
 *
 * @example
 * ```typescript
 * const startDate = new Date('2024-01-01');
 * const expirationDate = calculateValidUntil(startDate, 3, 'monthly'); // Returns a date 3 months after January 1, 2024
 * ```
 */
export function calculateValidUntil(
	validFrom: Date,
	billingPeriods: number,
	billingInterval: "monthly" | "yearly" | "weekly",
): Date {
	const validUntil = new Date(validFrom);
	if (billingInterval === "monthly")
		validUntil.setMonth(validFrom.getMonth() + billingPeriods);
	else if (billingInterval === "yearly")
		validUntil.setMonth(validFrom.getMonth() + billingPeriods * MONTH_IN_YEAR);
	else if (billingInterval === "weekly")
		validUntil.setDate(validFrom.getDate() + billingPeriods * DAYS_IN_WEEK);
	return validUntil;
}

/**
 * Determines the current state of a membership based on its validity period.
 *
 * @param validFrom - The date when the membership becomes valid/active
 * @param validUntil - The date when the membership expires
 * @returns The current state of the membership:
 *   - "pending" if the membership hasn't started yet (validFrom is in the future)
 *   - "expired" if the membership has ended (validUntil is in the past)
 *   - "active" if the membership is currently valid (between validFrom and validUntil)
 *
 * @example
 * ```typescript
 * const futureDate = new Date('2024-12-01');
 * const pastDate = new Date('2023-01-01');
 * const currentDate = new Date();
 *
 * getMemershipState(futureDate, new Date('2025-01-01')); // returns "pending"
 * getMemershipState(pastDate, new Date('2023-06-01')); // returns "expired"
 * getMemershipState(pastDate, futureDate); // returns "active"
 * ```
 */
export function getMemershipState(
	validFrom: Date,
	validUntil: Date,
): Membership["state"] {
	if (validFrom > new Date()) return "pending"; // Membership is not yet active - it starts in the future
	if (validUntil < new Date()) return "expired"; // Membership has expired
	return "active"; // Membership is currently active
}

export async function getMemberships(): Promise<
	{ membership: Membership; periods: MembershipPeriod[] }[]
> {
	const rows = [];
	for (const membership of memberships) {
		const periods = membershipPeriods.filter(
			(p) => p.membershipId === membership.id,
		);
		rows.push({ membership, periods });
	}
	return rows;
}

export function createNewMembership(membership: {
	name: string;
	validFrom: Date;
	validUntil: Date;
	paymentMethod: Membership["paymentMethod"];
	recurringPrice: number;
	billingPeriods: number;
	billingInterval: Membership["billingInterval"];
	userId: number;
}): Membership {
	const {
		name,
		validFrom,
		validUntil,
		paymentMethod,
		recurringPrice,
		billingPeriods,
		billingInterval,
		userId,
	} = membership;
	const newMembership = {
		id: memberships.length + 1,
		uuid: uuidv4(),
		name: name,
		state: getMemershipState(validFrom, validUntil),
		validFrom,
		validUntil,
		user: userId,
		paymentMethod,
		recurringPrice,
		billingPeriods,
		billingInterval,
	};
	memberships.push(newMembership);
	return newMembership;
}

export function createMembershipPeriods(data: {
	validFrom: Date;
	billingPeriods: number;
	billingInterval: Membership["billingInterval"];
	newMembershipId: number;
}) {
	const { validFrom, billingPeriods, billingInterval, newMembershipId } = data;
	const newMembershipPeriods = [];
	let periodStart = validFrom;
	for (let i = 0; i < billingPeriods; i++) {
		const validFrom = periodStart;
		const validUntil = calculateValidUntil(
			validFrom,
			1, // each period is 1 billing period
			billingInterval,
		);
		const period: MembershipPeriod = {
			id: i + 1,
			uuid: uuidv4(),
			membershipId: newMembershipId,
			start: validFrom,
			end: validUntil,
			state: "planned", // why is it always planned?
		};
		newMembershipPeriods.push(period);
		periodStart = validUntil;
	}
	membershipPeriods.push(...newMembershipPeriods);
	return newMembershipPeriods;
}
