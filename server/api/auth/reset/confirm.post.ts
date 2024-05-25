import * as bcrypt from "bcrypt";

import DB from "~/utils/db/actions";
import { z } from "zod";

const bodyParser = z.object({
    challengeId: z.string(),
    resetCode: z.string().min(6).max(6),
    newPassword: z.string(),
});

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const body = await readBody(event);

    try {
        const { challengeId, resetCode, newPassword } = bodyParser.parse(body);

        const challenge = await DB.auth.getChallenge(challengeId);
        if (!challenge)
            return createError({
                statusCode: 400,
                message: "Challenge doesn't exist.",
            });

        if (challenge.defeated)
            return createError({
                statusCode: 400,
                message: "Challenge already defeated.",
            });

        if (challenge.type !== "reset")
            return createError({
                statusCode: 400,
                message: "Challenge purpose mismatch.",
            });

        if (
            new Date(Date.now()).getTime() >
            challenge.createdAt.getTime() +
                config.auth.verificationCodeExpiryTime
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

        if (!(await bcrypt.compare(resetCode, challenge.verificationCode)))
            return createError({
                statusCode: 400,
                message: "Incorrect verification code.",
            });

        await DB.auth.resetPassword(userId, newPassword);

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
