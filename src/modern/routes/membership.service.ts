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
