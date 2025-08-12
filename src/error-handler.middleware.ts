import express, { type ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
	console.error(err.stack);
	res.status(500).json({
		error: "Internal Server Error",
		message: err.message,
	});
};

export type StandardErorrType = keyof typeof STANDARD_ERRORS;
export const STANDARD_ERRORS = {
	MISSING_MANDATORY_FIELDS: { status: 400, message: "missingMandatoryFields" },
	NEGATIVE_RECURRING_PRICE: { status: 400, message: "negativeRecurringPrice" },
	CASH_PRICE_BELOW_100: { status: 400, message: "cashPriceBelow100" },
	BILLING_PERIODS_MORE_THAN_12_MONTHS: {
		status: 400,
		message: "billingPeriodsMoreThan12Months",
	},
	BILLING_PERIODS_LESS_THAN_6_MONTHS: {
		status: 400,
		message: "billingPeriodsLessThan6Months",
	},
	BILLING_PERIODS_MORE_THAN_10_YEARS: {
		status: 400,
		message: "billingPeriodsMoreThan10Years",
	},
	BILLING_PERIODS_LESS_THAN_3_YEARS: {
		status: 400,
		message: "billingPeriodsLessThan3Years",
	},
	INVALID_BILLING_PERIODS: { status: 400, message: "invalidBillingPeriods" },
} as const;

export const responseRouter = express.Router();
responseRouter.use((_req, res, next) => {
	// Override the res object to include a standardized error response method
	// @ts-ignore
	res.sendError = (errorKey: keyof typeof STANDARD_ERRORS) => {
		const error = STANDARD_ERRORS[errorKey];
		res.status(error.status).json({ message: error.message });
	};
	next();
});
