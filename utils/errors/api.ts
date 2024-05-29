import type { ZodError } from "zod";

interface APIError {
	url: string;
	statusCode: number;
	statusMessage: string;
	message: string;
	stack: string;
}

function statusMessageFromZodError(e: ZodError): string {
	const errorMessages = e.issues.map((issue) => {
		const { path, message } = issue;
		return `${path.join(".")}: ${message}`;
	});

	const statusMessage = errorMessages.join(", ");

	return statusMessage;
}

export { type APIError, statusMessageFromZodError };
