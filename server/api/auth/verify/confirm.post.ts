import * as bcrypt from "bcrypt";

import { ZodError, z } from "zod";
import { zodToken, zodUUID } from "~/utils/validation/common";

import DB from "~/utils/db/actions";
import { statusMessageFromZodError } from "~/utils/errors/api";

const bodyParser = z.object({
	challengeId: zodUUID,
	token: zodToken,
});

export default defineEventHandler(async (event) => {
	const NODE_ENV = process.env.NODE_ENV;
	if (!NODE_ENV)
		throw new Error("`NODE_ENV` environment variable is undefined.");

	const config = useRuntimeConfig();
	const body = await readBody(event);

	try {
		const { challengeId, token } = bodyParser.parse(body);

		const challenge = await DB.auth.getChallenge(challengeId);
		if (!challenge)
			return createError({
				statusCode: 404,
				statusMessage: "Challenge doesn't exist.",
			});

		if (challenge.used)
			return createError({
				statusCode: 410,
				statusMessage: "Challenge already used.",
			});

		if (challenge.type !== "verification")
			return createError({
				statusCode: 404,
				statusMessage: "Challenge purpose mismatch.",
			});

		if (
			new Date(Date.now()).getTime() >
			challenge.createdAt.getTime() +
				config.auth.verificationCodeExpiryTimeMs
		) {
			return createError({
				statusCode: 410,
				statusMessage: "Verification token has expired.",
			});
		}

		if (!(await bcrypt.compare(token, challenge.tokenHash)))
			return createError({
				statusCode: 400,
				statusMessage: "Invalid verification code.",
			});

		const userId = await DB.auth.attemptChallenge(challengeId);

		if (!userId)
			return createError({
				statusCode: 400,
				statusMessage: "Failed to defeat challenge.",
			});

		await DB.auth.verifyUser(userId);

		const sessionToken = await DB.auth.createSession({ userId });
		if (!sessionToken)
			return createError({
				statusCode: 500,
				statusMessage: "Authentication failed.",
			});

		setCookie(event, "session-token", sessionToken, {
			httpOnly: true,
			secure: NODE_ENV === "production",
			sameSite: "strict",
			maxAge: config.auth.sessionExpiryTimeMs / 1000,
		});

		return {
			statusCode: 200,
			statusMessage: "Success.",
		};
	} catch (error: any) {
		console.log(error);

		if (error instanceof ZodError) {
			return createError({
				statusCode: 400,
				statusMessage: statusMessageFromZodError(error),
			});
		}

		return createError({
			statusCode: 500,
			statusMessage: "An error occurred. Please try again later.",
		});
	}
});
