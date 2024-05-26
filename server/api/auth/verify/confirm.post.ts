import * as bcrypt from "bcrypt";

import { zodToken, zodUUID } from "~/utils/validation/common";

import DB from "~/utils/db/actions";
import { z } from "zod";

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
                statusCode: 400,
                statusMessage: "Challenge doesn't exist.",
            });

        if (challenge.used)
            return createError({
                statusCode: 400,
                statusMessage: "Challenge already used.",
            });

        if (challenge.type !== "verification")
            return createError({
                statusCode: 400,
                statusMessage: "Challenge purpose mismatch.",
            });

        if (
            new Date(Date.now()).getTime() >
            challenge.createdAt.getTime() +
                config.auth.verificationCodeExpiryTime
        ) {
            return createError({
                statusCode: 400,
                statusMessage: "Challenge expired.",
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

        await DB.auth.verifyUser(userId);

        return {
            statusCode: 200,
            statusMessage: "Success.",
        };
    } catch (error: any) {
        console.log(error);

        return createError({
            statusCode: 500,
            statusMessage: "Internal Server Error.",
        });
    }
});
