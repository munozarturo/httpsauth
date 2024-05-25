import * as bcrypt from "bcrypt";

import DB from "~/utils/db/actions";
import { z } from "zod";

const bodyParser = z.object({
    challengeId: z.string(),
    verificationCode: z.string().min(6).max(6),
});

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const body = await readBody(event);

    try {
        const { challengeId, verificationCode } = bodyParser.parse(body);

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

        if (challenge.type !== "verification")
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

        if (!(await bcrypt.compare(verificationCode, challenge.tokenHash)))
            return createError({
                statusCode: 400,
                message: "Incorrect verification code.",
            });

        const userId = await DB.auth.defeatChallenge(challengeId);

        if (!userId)
            return createError({
                statusCode: 400,
                message: "Failed to defeat challenge.",
            });

        await DB.auth.verifyUser(userId);

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
