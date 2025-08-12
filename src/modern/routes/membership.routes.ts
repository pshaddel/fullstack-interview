import express, { type Request, type Response } from "express";
import {
	calculateValidUntil,
	getMemberships,
	getMemershipState,
} from "./membership.service";
import { validateMembershipCreation } from "./membership.validator";

export interface Membership {
	id: number;
	name: string;
	/* the user that the membership is assigned to */
	user: number;
	/* price the user has to pay for every period */
	recurringPrice: number;
	validFrom: Date;
	validUntil: Date;
	state: "active" | "pending" | "expired";
	paymentMethod: "cash" | "creditCard" | (string & {});
	billingInterval: "weekly" | "monthly" | "yearly";
	/* the number of periods the membership has validity for
	 * e.g. 6 months, 12 months, 3 years, etc.
	 * this is used to calculate the end date of the membership
	 */
	billingPeriods: number;
}

export interface MembershipPeriod {
	id: number;
	uuid: string;
	/* membership the period is attached to */
	membershipId: number;
	/* indicates the start of the period */
	start: Date;
	/* indicates the end of the period */
	end: Date;
	state: "planned" | "issued" | "cancelled";
}

const memberships = require("../../data/memberships.json") as Membership[];
const membershipPeriods =
	require("../../data/membership-periods.json") as MembershipPeriod[];
const { v4: uuidv4 } = require("uuid");

const router = express.Router();

const userId = 2000;

router.post("/", (req: Request, res: Response) => {
	const { error, data } = validateMembershipCreation(req.body);
	if (error) return res.sendError(error);
	const {
		name,
		paymentMethod,
		recurringPrice,
		billingPeriods,
		billingInterval,
		validFrom,
	} = data;

	const validUntil = calculateValidUntil(
		validFrom,
		billingPeriods,
		billingInterval,
	);

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
			membershipId: newMembership.id,
			start: validFrom,
			end: validUntil,
			state: "planned", // why is it always planned?
		};
		newMembershipPeriods.push(period);
		periodStart = validUntil;
	}
	membershipPeriods.push(...newMembershipPeriods);

	res
		.status(201)
		.json({
			membership: newMembership,
			membershipPeriods: newMembershipPeriods,
		});
});

router.get("/", async (_req: Request, res: Response) => {
	const memberships = await getMemberships();
	res.status(200).json(memberships);
});

export default router;
