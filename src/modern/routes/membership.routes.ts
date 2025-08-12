import express, { type Request, type Response } from "express";
import {
	calculateValidUntil,
	createMembershipPeriods,
	createNewMembership,
	getMemberships,
} from "./membership.service";

const _memberships = require("../../data/memberships.json") as Membership[];
const _membershipPeriods =
	require("../../data/membership-periods.json") as MembershipPeriod[];
const { v4: uuidv4 } = require("uuid");

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

const userId = 2000;

const router = express.Router();
router.post("/", async (req: Request, res: Response) => {
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

	const newMembership = await createNewMembership({
		name,
		validFrom,
		validUntil,
		paymentMethod,
		recurringPrice,
		billingPeriods,
		billingInterval,
		userId,
	});

	const newMembershipPeriods = await createMembershipPeriods({
		validFrom,
		billingPeriods,
		billingInterval,
		newMembershipId: newMembership.id,
	});

	res.status(201).json({
		membership: newMembership,
		membershipPeriods: newMembershipPeriods,
	});
});

router.get("/", async (_req: Request, res: Response) => {
	const memberships = await getMemberships();
	res.status(200).json(memberships);
});

export default router;
