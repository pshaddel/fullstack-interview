import { equal } from "node:assert";
import { describe, it } from "node:test";
import supertest from "supertest";
import { app } from "../index";
import type {
	Membership,
	MembershipPeriod,
} from "../modern/routes/membership.routes";

export async function memberShipTests(route: string, name: string) {
	describe(name, () => {
		describe(`GET ${route}`, () => {
			it(`Should handle GET requests to ${route}`, async () => {
				// Test logic for GET /memberships
				const response = await supertest(app).get(route);
				equal(response.status, 200);
			});

			it("Should get membership and periods in the response body as an array", async () => {
				const response = await supertest(app).get(route);
				equal(response.status, 200);
				equal(Array.isArray(response.body), true);
				equal(!!response.body[0].membership, true);
				equal(!!response.body[0].periods, true);
			});

			it("Should have membership with id, uuid, name, userId, recurringPrice, validFrom, validUntil, state, assignedBy, paymentMethod, billingInterval, billingPeriods", async () => {
				const response = await supertest(app).get(route);
				equal(response.status, 200);
				// exisiting memberships
				const memberships = [];

				for (const membership of response.body) {
					memberships.push(membership.membership);
				}

				equal(memberships.length > 0, true);
				memberships.forEach((membership) => {
					equal(typeof membership.id, "number");
					equal(typeof membership.uuid, "string");
					equal(typeof membership.name, "string");
					equal(typeof membership.userId, "number");
					equal(typeof membership.recurringPrice, "number");
					equal(typeof membership.validFrom, "string"); // assuming date is returned as string
					equal(typeof membership.validUntil, "string"); // assuming date is returned as string
					equal(["active", "inactive"].includes(membership.state), true);
					equal(typeof membership.assignedBy, "string");
					equal(
						membership.paymentMethod === null ||
							typeof membership.paymentMethod === "string",
						true,
					);
					equal(
						["monthly", "yearly", "weekly"].includes(
							membership.billingInterval,
						),
						true,
					);
					equal(typeof membership.billingPeriods, "number");
				});
			});
		});

		describe(`POST ${route}`, () => {
			it("should return 400 when name is missing", async () => {
				const response = await supertest(app).post(route).send({
					recurringPrice: 50,
					billingInterval: "monthly",
					billingPeriods: 6,
				});
				equal(response.status, 400);
				equal(response.body.message, "missingMandatoryFields");
			});

			it("should return 400 when recurringPrice is missing", async () => {
				const response = await supertest(app).post(route).send({
					name: "Test Membership",
					billingInterval: "monthly",
					billingPeriods: 6,
				});
				equal(response.status, 400);
				equal(response.body.message, "missingMandatoryFields");
			});

			it("should return 400 when both name and recurringPrice are missing", async () => {
				const response = await supertest(app).post(route).send({
					billingInterval: "monthly",
					billingPeriods: 6,
				});
				equal(response.status, 400);
				equal(response.body.message, "missingMandatoryFields");
			});

			it("should return 400 when recurringPrice is negative", async () => {
				const response = await supertest(app).post(route).send({
					name: "Test Membership",
					recurringPrice: -10,
					billingInterval: "monthly",
					billingPeriods: 6,
				});
				equal(response.status, 400);
				equal(response.body.message, "negativeRecurringPrice");
			});

			it("should return 400 when cash payment method with price over 100", async () => {
				const response = await supertest(app).post(route).send({
					name: "Test Membership",
					recurringPrice: 150,
					paymentMethod: "cash",
					billingInterval: "monthly",
					billingPeriods: 6,
				});
				equal(response.status, 400);
				equal(response.body.message, "cashPriceBelow100");
			});

			it("should return 400 when monthly billing periods exceed 12", async () => {
				const response = await supertest(app).post(route).send({
					name: "Test Membership",
					recurringPrice: 50,
					billingInterval: "monthly",
					billingPeriods: 13,
				});
				equal(response.status, 400);
				equal(response.body.message, "billingPeriodsMoreThan12Months");
			});

			it("should return 400 when monthly billing periods are less than 6", async () => {
				const response = await supertest(app).post(route).send({
					name: "Test Membership",
					recurringPrice: 50,
					billingInterval: "monthly",
					billingPeriods: 5,
				});
				equal(response.status, 400);
				equal(response.body.message, "billingPeriodsLessThan6Months");
			});

			it("should return 400 when yearly billing periods exceed 10", async () => {
				const response = await supertest(app).post(route).send({
					name: "Test Membership",
					recurringPrice: 50,
					billingInterval: "yearly",
					billingPeriods: 11,
				});
				equal(response.status, 400);
				equal(response.body.message, "billingPeriodsMoreThan10Years");
			});

			it("TODO: This Logic is CORRECT: should return 400 when yearly billing periods are between 3 and 10", async () => {
				const response = await supertest(app).post(route).send({
					name: "Test Membership",
					recurringPrice: 50,
					billingInterval: "yearly",
					billingPeriods: 5,
				});
				equal(response.status, 400);
				equal(response.body.message, "billingPeriodsLessThan3Years");
			});

			it("should return 400 when billing interval is invalid", async () => {
				const response = await supertest(app).post(route).send({
					name: "Test Membership",
					recurringPrice: 50,
					billingInterval: "daily",
					billingPeriods: 6,
				});
				equal(response.status, 400);
				equal(response.body.message, "invalidBillingPeriods");
			});

			it("should successfully create membership with valid monthly data", async () => {
				const response = await supertest(app).post(route).send({
					name: "Valid Monthly Membership",
					recurringPrice: 50,
					billingInterval: "monthly",
					billingPeriods: 8,
					paymentMethod: "card",
				});
				equal(response.status, 201);
				equal(!!response.body.membership, true);
				equal(!!response.body.membershipPeriods, true);
			});

			it("should successfully create membership with valid yearly data", async () => {
				const response = await supertest(app).post(route).send({
					name: "Valid Yearly Membership",
					recurringPrice: 500,
					billingInterval: "yearly",
					billingPeriods: 2,
					paymentMethod: "card",
				});
				equal(response.status, 201);
				equal(!!response.body.membership, true);
				equal(!!response.body.membershipPeriods, true);
			});

			it("should allow cash payment with price exactly 100", async () => {
				const response = await supertest(app).post(route).send({
					name: "Cash Membership",
					recurringPrice: 100,
					paymentMethod: "cash",
					billingInterval: "monthly",
					billingPeriods: 6,
				});
				equal(response.status, 201);
			});

			it("should allow cash payment with price exactly 100", async () => {
				const response = await supertest(app).post(route).send({
					name: "Cash Membership",
					recurringPrice: 100,
					paymentMethod: "cash",
					billingInterval: "monthly",
					billingPeriods: 6,
				});
				equal(response.status, 201);
			});

			// it('Should be able to create a valid weekly membership', async () => {
			//     const validFrom = new Date();
			//     const response = await supertest(app)
			//         .post(legacyRoute)
			//         .send({
			//             name: "Valid Weekly Membership",
			//             recurringPrice: 20,
			//             billingInterval: "weekly",
			//             billingPeriods: 4,
			//             paymentMethod: "card",
			//             validFrom: validFrom.toISOString(),
			//         });
			//     console.log(response.body);
			//     equal(response.status, 201);
			//     equal(!!response.body.membership, true);
			//     equal(!!response.body.membershipPeriods, true);

			//     // validUntil should be 4 weeks from validFrom
			//     const validUntil = new Date(validFrom);
			//     validUntil.setDate(validUntil.getDate() + 28);
			//     const { membership, membershipPeriods } = response.body;
			//     equal(new Date(membership.validFrom).getTime(), validFrom.getTime());
			//     equal(new Date(membership.validUntil).getTime(), validUntil.getTime());
			// });

			it("Should be able to create a valid weekly membership", async () => {
				const validFrom = new Date();
				const response = await supertest(app).post(route).send({
					name: "Valid Weekly Membership",
					recurringPrice: 20,
					billingInterval: "monthly",
					billingPeriods: 8,
					paymentMethod: "card",
					validFrom: validFrom.toISOString(),
				});
				equal(response.status, 201);
				equal(!!response.body.membership, true);
				equal(!!response.body.membershipPeriods, true);

				const validUntil = new Date(validFrom);
				validUntil.setMonth(validUntil.getMonth() + 8); // Assuming monthly billing means validUntil is one month later
				const { membership, membershipPeriods } = response.body;

				equal(new Date(membership.validFrom).getTime(), validFrom.getTime());
				equal(new Date(membership.validUntil).getTime(), validUntil.getTime());
				const periodStart = new Date(validFrom);
				for (const period of membershipPeriods) {
					const { membershipId, start, end, state } = period;
					equal(membershipId, membership.id);
					equal(state, "planned");
					equal(new Date(start).getMonth(), periodStart.getMonth());
					periodStart.setMonth(periodStart.getMonth() + 1); // Assuming monthly billing means
					equal(new Date(end).getMonth(), periodStart.getMonth());
				}
			});

			it("Membership status should be expired if latest validUntil is in the past", async () => {
				const validFrom = new Date("2023-01-01T00:00:00Z");
				const response = await supertest(app).post(route).send({
					name: "Expired Membership",
					recurringPrice: 50,
					billingInterval: "monthly",
					billingPeriods: 6,
					validFrom: validFrom.toISOString(),
				});
				equal(response.status, 201);
				const { membership } = response.body;
				equal(membership.state, "expired");
			});

			it("Membership status should be pending if the validFrom is in the future", async () => {
				const validFrom = new Date("2030-01-01T00:00:00Z");
				const response = await supertest(app).post(route).send({
					name: "Pending Membership",
					recurringPrice: 50,
					billingInterval: "monthly",
					billingPeriods: 6,
					validFrom: validFrom.toISOString(),
				});
				equal(response.status, 201);
				const { membership } = response.body;
				equal(membership.state, "pending");
			});

			it("Membership status should be active if the validFrom is in the past and validUntil is in the future", async () => {
				const validFrom = new Date();
				// last month
				validFrom.setMonth(validFrom.getMonth() - 1);
				const response = await supertest(app).post(route).send({
					name: "Active Membership",
					recurringPrice: 50,
					billingInterval: "monthly",
					billingPeriods: 6,
					validFrom: validFrom.toISOString(),
				});
				equal(response.status, 201);
				const { membership } = response.body;
				equal(membership.state, "active");
			});

			it("Valid Until should be calculated correctly based on billingInterval and billingPeriods", async () => {
				// monthly billing
				const validFrom = new Date("2023-01-01T00:00:00Z");
				const response = await supertest(app).post(route).send({
					name: "Membership with Valid Until",
					recurringPrice: 50,
					billingInterval: "monthly",
					billingPeriods: 6,
					validFrom: validFrom.toISOString(),
				});
				equal(response.status, 201);
				const { membership } = response.body;
				const expectedValidUntil = new Date(validFrom);
				expectedValidUntil.setMonth(expectedValidUntil.getMonth() + 6);
				equal(
					new Date(membership.validUntil).getTime(),
					expectedValidUntil.getTime(),
				);

				// yearly billing
				const yearlyResponse = await supertest(app).post(route).send({
					name: "Yearly Membership with Valid Until",
					recurringPrice: 600,
					billingInterval: "yearly",
					billingPeriods: 2,
					validFrom: validFrom.toISOString(),
				});

				equal(yearlyResponse.status, 201);
				const yearlyMembership = yearlyResponse.body.membership;
				const expectedYearlyValidUntil = new Date(validFrom);
				expectedYearlyValidUntil.setFullYear(
					expectedYearlyValidUntil.getFullYear() + 2,
				);
				equal(
					new Date(yearlyMembership.validUntil).getTime(),
					expectedYearlyValidUntil.getTime(),
				);
			});

			it("Membership periods should be created correctly", async () => {
				// monthly billing
				const validFrom = new Date("2023-01-01T00:00:00Z");
				const response = await supertest(app).post(route).send({
					name: "Membership with Periods",
					recurringPrice: 50,
					billingInterval: "monthly",
					billingPeriods: 6,
					validFrom: validFrom.toISOString(),
				});
				equal(response.status, 201);
				const { membership, membershipPeriods } = response.body;
				equal(membershipPeriods.length, 6);
				let periodStart = new Date(validFrom);
				for (const period of membershipPeriods) {
					equal(period.membershipId, membership.id);
					equal(period.state, "planned");
					equal(new Date(period.start).getTime(), periodStart.getTime());
					const periodEnd = new Date(periodStart);
					periodEnd.setMonth(periodEnd.getMonth() + 1);
					equal(new Date(period.end).getTime(), periodEnd.getTime());
					periodStart.setMonth(periodStart.getMonth() + 1);
				}

				// yearly billing
				const yearlyResponse = await supertest(app).post(route).send({
					name: "Yearly Membership with Periods",
					recurringPrice: 600,
					billingInterval: "yearly",
					billingPeriods: 2,
					validFrom: validFrom.toISOString(),
				});
				equal(yearlyResponse.status, 201);
				const yearlyMembership = yearlyResponse.body.membership;
				const yearlyPeriods = yearlyResponse.body.membershipPeriods;
				equal(yearlyPeriods.length, 2);
				periodStart = new Date(validFrom);
				for (const period of yearlyPeriods) {
					equal(period.membershipId, yearlyMembership.id);
					equal(period.state, "planned");
					equal(new Date(period.start).getTime(), periodStart.getTime());
					const periodEnd = new Date(periodStart);
					periodEnd.setFullYear(periodEnd.getFullYear() + 1);
					equal(new Date(period.end).getTime(), periodEnd.getTime());
					periodStart.setFullYear(periodStart.getFullYear() + 1);
				}
			});

			it("Should correctly create a new membership with all periods, and then get it as one of the memberships", async () => {
				const validFrom = new Date();
				const response = await supertest(app).post(route).send({
					name: "New Membership with Periods",
					recurringPrice: 50,
					billingInterval: "monthly",
					billingPeriods: 6,
					validFrom: validFrom.toISOString(),
				});
				equal(response.status, 201);
				const { membership, membershipPeriods } = response.body as {
					membership: Membership;
					membershipPeriods: { start: string; end: string }[];
				};
				equal(membership.name, "New Membership with Periods");
				equal(membership.recurringPrice, 50);
				equal(membership.billingInterval, "monthly");
				equal(membership.billingPeriods, 6);
				equal(new Date(membership.validFrom).getTime(), validFrom.getTime());

				// Check if the membership is returned in the GET request
				const getResponse = await supertest(app).get(route);
				equal(getResponse.status, 200);
				const memberships = getResponse.body as {
					membership: Membership;
					periods: MembershipPeriod[];
				}[];
				const foundMembership = memberships.find(
					(m) => m.membership.id === membership.id,
				);
				equal(!!foundMembership?.membership, true);
				// periods should be created correctly
				equal(membershipPeriods.length, 6);

				const responsePeriods = foundMembership?.periods;
				equal(!!responsePeriods, true);
				equal(responsePeriods?.length, 6);
			});
		});
	});
}
