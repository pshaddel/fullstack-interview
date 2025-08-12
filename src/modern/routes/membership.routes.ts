import express, { type Request, type Response } from "express";
import {
	calculateValidUntil,
	createMembershipPeriods,
	createNewMembership,
	getMemberships,
} from "./membership.service";
import { validateMembershipCreation } from "./membership.validator";

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
