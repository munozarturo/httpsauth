import * as bcrypt from "bcrypt";

import DB from "~/utils/db/actions";
import { sendEmail } from "~/utils/aws/ses";
import { z } from "zod";

const bodyParser = z.object({
    email: z.string().email(),
});

export default defineEventHandler(async (event) => {
    const DOMAIN = process.env.DOMAIN;
    if (!DOMAIN) throw new Error("`DOMAIN` environment variable is undefined.");

    const body = await readBody(event);

    try {
        const { email } = bodyParser.parse(body);

        const user = await DB.auth.getUser({ email });
        if (!user)
            return createError({
                statusCode: 400,
                message: "Email not in use.",
            });

        const resetCode = Math.round(Math.random() * 1000000)
            .toString()
            .padStart(6, "0");
        const resetCodeHash = await bcrypt.hash(resetCode, 10);

        const challengeId = await DB.auth.createChallenge({
            type: "reset",
            userId: user.id,
            tokenHash: resetCodeHash,
        });

        await sendEmail({
            source: `${DOMAIN} <password-reset@auth.${DOMAIN}>`,
            destination: { to: email },
            subject: "Reset Your Password",
            body: {
                html: `${resetCode}`,
                text: `${resetCode}`,
            },
            replyTo: `contact@${DOMAIN}`,
        });

        return {
            message: "Success.",
            challengeId,
        };
    } catch (error: any) {
        console.log(error);

        return createError({
            statusCode: 500,
            message: "Internal Server Error.",
        });
    }
});
