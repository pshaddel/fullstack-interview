import type { StandardErorrType } from "../../error-handler.middleware";

type ValidatorResult<T> =
	| { error: null; data: T }
	| { error: StandardErorrType; data: null };

type MembershipCreationData = {
	name: string;
	userId: number;
	paymentMethod: "cash" | "creditCard" | (string & {});
	recurringPrice: number;
	validFrom: Date;
	billingPeriods: number;
	billingInterval: "monthly" | "yearly";
};

export function validateMembershipCreation(
	// biome-ignore lint/suspicious/noExplicitAny: body parameter accepts dynamic form data
	body: Record<string, any>,
): ValidatorResult<MembershipCreationData> {
	const {
		name,
		userId,
		paymentMethod,
		recurringPrice,
		validFrom,
		billingPeriods,
		billingInterval,
	} = body;
	if (!name || !recurringPrice)
		return { error: "MISSING_MANDATORY_FIELDS", data: null };
	if (recurringPrice < 0)
		return { error: "NEGATIVE_RECURRING_PRICE", data: null };
	if (recurringPrice > 100 && paymentMethod === "cash")
		return { error: "CASH_PRICE_BELOW_100", data: null };
	if (billingInterval === "monthly" && billingPeriods > 12)
		return { error: "BILLING_PERIODS_MORE_THAN_12_MONTHS", data: null };
	if (billingInterval === "monthly" && billingPeriods < 6)
		return { error: "BILLING_PERIODS_LESS_THAN_6_MONTHS", data: null };
	if (!["yearly", "monthly"].includes(billingInterval))
		return { error: "INVALID_BILLING_PERIODS", data: null };
	if (billingInterval === "yearly" && billingPeriods > 10)
		return { error: "BILLING_PERIODS_MORE_THAN_10_YEARS", data: null };
	if (billingInterval === "yearly" && billingPeriods > 3)
		return { error: "BILLING_PERIODS_LESS_THAN_3_YEARS", data: null };

	return {
		error: null,
		data: {
			name,
			userId,
			paymentMethod,
			recurringPrice,
			validFrom: validFrom ? new Date(validFrom) : new Date(),
			billingPeriods,
			billingInterval,
		},
	};
}
