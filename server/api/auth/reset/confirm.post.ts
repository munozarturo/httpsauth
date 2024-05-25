import * as bcrypt from "bcrypt";

import { zodPassword, zodToken, zodUUID } from "~/utils/validation/common";

import DB from "~/utils/db/actions";
import { z } from "zod";

const bodyParser = z.object({
    challengeId: zodUUID,
    token: zodToken,
    password: zodPassword,
});

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const body = await readBody(event);

    try {
        const { challengeId, token, password } = bodyParser.parse(body);

        const challenge = await DB.auth.getChallenge(challengeId);
        if (!challenge)
            return createError({
                statusCode: 400,
                message: "Challenge doesn't exist.",
            });

        if (challenge.used)
            return createError({
                statusCode: 400,
                message: "Challenge already used.",
            });

        if (challenge.type !== "reset")
            return createError({
                statusCode: 400,
                message: "Challenge purpose mismatch.",
            });

        if (
            new Date(Date.now()).getTime() >
            challenge.createdAt.getTime() + config.auth.resetCodeExpiryTime
        ) {
            return createError({
                statusCode: 400,
                message: "Challenge expired.",
            });
        }

        const userId = await DB.auth.defeatChallenge(challengeId);

        if (!userId)
            return createError({
                statusCode: 400,
                message: "Failed to defeat challenge.",
            });

        if (!(await bcrypt.compare(token, challenge.tokenHash)))
            return createError({
                statusCode: 400,
                message: "Incorrect verification code.",
            });

        const passwordHash = await bcrypt.hash(password, 10);

        await DB.auth.resetPassword(userId, passwordHash);

        return {
            message: "Success.",
        };
    } catch (error: any) {
        console.log(error);

        return createError({
            statusCode: 500,
            message: "Internal Server Error.",
        });
    }
});
