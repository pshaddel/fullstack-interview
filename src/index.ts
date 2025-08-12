import express from "express";
import { errorHandler, responseRouter } from "./error-handler.middleware";
import legacyMembershipRoutes from "./legacy/routes/membership.routes";
import membershipRoutes from "./modern/membership/membership.routes";

const app = express();
const port = process.env.PORT ? Number.parseInt(process.env.PORT) : 3099;
app.use(responseRouter);
app.use(express.json());
app.use("/memberships", membershipRoutes);
app.use("/legacy/memberships", legacyMembershipRoutes);
app.use("/health", (_req, res) => {
	res.status(200).json({ status: "ok" });
});
app.use(errorHandler);

if (process.env.NODE_ENV !== "test") {
	app.listen(port, () => {
		console.log(`Server running on http://localhost:${port}`);
	});
}

export { app };
