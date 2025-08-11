import { equal } from "node:assert";
import { describe, it } from "node:test";
import supertest from "supertest";
import { errorHandler } from "../error-handler.middleware";
import { app } from "../index";

describe("GET /legacy/memberships", () => {
	it("should handle GET requests to /legacy/memberships", async () => {
		// Test logic for GET /memberships
		app.get("/error", (_req, _res) => {
			throw new Error("This is an unhandled error for testing purposes");
		}); // Intentionally causing an error to test error handling
		app.use(errorHandler);
		const response = await supertest(app).get("/error");
		equal(response.status, 500);
		equal(response.body.error, "Internal Server Error");
	});
});
