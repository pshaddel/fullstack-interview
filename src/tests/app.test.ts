import { describe, it } from "node:test";
import { equal } from "node:assert";
import { app } from "../index";
import request from "supertest";

describe("Membership Routes", () => {
	it("Should get 200 on health check", async () => {
		const response = await request(app).get("/health");
		equal(response.status, 200);
		equal(response.body.status, "ok");
	});
});
