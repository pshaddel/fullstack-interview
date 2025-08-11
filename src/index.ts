import express from "express";
import membershipRoutes from "./modern/routes/membership.routes";
import { errorHandler } from "./error-handler.middleware";

// because of the javascript module, we need to use require to import the legacy routes
const legacyMembershipRoutes = require("./legacy/routes/membership.routes");

const app = express();
const port = process.env.PORT ? Number.parseInt(process.env.PORT) : 3099;

app.use(express.json());
app.use("/memberships", membershipRoutes);
app.use("/legacy/memberships", legacyMembershipRoutes);
app.use("/health", (req, res) => {
	res.status(200).json({ status: "ok" });
});
app.use(errorHandler);

if (process.env.NODE_ENV !== "test") {
	app.listen(port, () => {
		console.log(`Server running on http://localhost:${port}`);
	});
}

export { app };
