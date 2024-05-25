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

        if (challenge.defeated)
            return createError({
                statusCode: 400,
                message: "Challenge already defeated.",
            });

        if (
            Date.now() + config.auth.verificationCodeExpiryTime >
            challenge.createdAt.getTime()
        )
            return createError({
                statusCode: 400,
                message: "Challenge expired.",
            });

        if (
            !(await bcrypt.compare(
                verificationCode,
                challenge.verificationCode
            ))
        )
            return createError({
                statusCode: 400,
                message: "Incorrect verification code.",
            });

        await DB.auth.defeatChallenge(challengeId);

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
