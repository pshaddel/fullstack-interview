import type { STANDARD_ERRORS } from "./error-handler.middleware";

declare global {
	namespace Express {
		interface Response {
			sendError(errorKey: keyof typeof STANDARD_ERRORS): void;
		}
	}
}

// export {};
