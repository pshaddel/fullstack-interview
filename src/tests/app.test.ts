import { equal } from "node:assert";
import { describe, it } from "node:test";
import request from "supertest";
import { app } from "../index";

describe("Express App", () => {
	it("Should get 200 on health check", async () => {
		const response = await request(app).get("/health");
		equal(response.status, 200);
		equal(response.body.status, "ok");
	});
});
