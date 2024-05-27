import * as bcrypt from "bcrypt";

import { ZodError, z } from "zod";
import { zodToken, zodUUID } from "~/utils/validation/common";

import DB from "~/utils/db/actions";
import { generateRandomString } from "~/utils/core";
import { statusMessageFromZodError } from "~/utils/errors/api";

const bodyParser = z.object({
    challengeId: zodUUID,
    token: zodToken,
});

export default defineEventHandler(async (event) => {
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

        if (challenge.type !== "reset-request")
            return createError({
                statusCode: 404,
                statusMessage: "Challenge purpose mismatch.",
            });

        if (
            new Date(Date.now()).getTime() >
            challenge.createdAt.getTime() + config.auth.resetCodeExpiryTimeMs
        ) {
            return createError({
                statusCode: 410,
                statusMessage: "Verification token has expired.",
            });
        }

        if (!(await bcrypt.compare(token, challenge.tokenHash)))
            return createError({
                statusCode: 400,
                statusMessage: "Incorrect verification code.",
            });

        const userId = await DB.auth.attemptChallenge(challengeId);

        if (!userId)
            return createError({
                statusCode: 400,
                statusMessage: "Failed to defeat challenge.",
            });

        const user = await DB.auth.getUser({ userId });
        if (user && !user.verified) DB.auth.verifyUser(userId);

        const resetToken = generateRandomString(128);
        const tokenHash = await bcrypt.hash(resetToken, 10);

        const confirmChallengeId = await DB.auth.createChallenge({
            type: "reset-confirmation",
            userId,
            tokenHash,
        });

        return {
            statusCode: 200,
            statusMessage: "Success.",
            resetToken,
            challengeId: confirmChallengeId,
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
            statusMessage: "Unknown Error.",
        });
    }
});
