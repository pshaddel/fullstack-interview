import express, { type Request, type Response } from "express";
import { validateMembershipCreation } from "./membership.validator";

interface Membership {
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

interface MembershipPeriod {
	/* membership the period is attached to */
	membership: number;
	/* indicates the start of the period */
	start: Date;
	/* indicates the end of the period */
	end: Date;
	state: string;
}

const memberships = require("../../data/memberships.json") as Membership[];
const membershipPeriods =
	require("../../data/membership-periods.json") as MembershipPeriod[];
const { v4: uuidv4 } = require("uuid");

const router = express.Router();

const userId = 2000;

router.post("/", (req: Request, res: Response) => {
	// const {
	// 	name,
	// 	recurringPrice,
	// 	paymentMethod,
	// 	billingInterval,
	// 	billingPeriods,
	// } = req.body;

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

	const validUntil = new Date(validFrom);

	if (billingInterval === "monthly") {
		validUntil.setMonth(validFrom.getMonth() + billingPeriods);
	} else if (billingInterval === "yearly") {
		validUntil.setMonth(validFrom.getMonth() + billingPeriods * 12);
	} else if (billingInterval === "weekly") {
		validUntil.setDate(validFrom.getDate() + billingPeriods * 7);
	}

	let state: Membership["state"] = "active";
	if (validFrom > new Date()) state = "pending"; // Membership is not yet active - it starts in the future
	if (validUntil < new Date()) state = "expired"; // Membership has expired

	const newMembership = {
		id: memberships.length + 1,
		uuid: uuidv4(),
		name: name,
		state,
		validFrom: validFrom,
		validUntil: validUntil,
		user: userId,
		paymentMethod: paymentMethod,
		recurringPrice: recurringPrice,
		billingPeriods: billingPeriods,
		billingInterval: billingInterval,
	};
	memberships.push(newMembership);

	const membershipPeriods = [];
	let periodStart = validFrom;
	for (let i = 0; i < billingPeriods; i++) {
		const validFrom = periodStart;
		const validUntil = new Date(validFrom);
		if (billingInterval === "monthly") {
			validUntil.setMonth(validFrom.getMonth() + 1);
		} else if (billingInterval === "yearly") {
			validUntil.setMonth(validFrom.getMonth() + 12);
		} else if (billingInterval === "weekly") {
			validUntil.setDate(validFrom.getDate() + 7);
		}
		const period = {
			id: i + 1,
			uuid: uuidv4(),
			membershipId: newMembership.id,
			start: validFrom,
			end: validUntil,
			state: "planned", // why is it always planned?
		};
		membershipPeriods.push(period);
		periodStart = validUntil;
	}

	res.status(201).json({ membership: newMembership, membershipPeriods });
});

router.get("/", (_req: Request, res: Response) => {
	const rows = [];
	for (const membership of memberships) {
		const periods = membershipPeriods.filter(
			(p: any) => p.membershipId === membership.id,
		);
		rows.push({ membership, periods });
	}
	res.status(200).json(rows);
});

export default router;
