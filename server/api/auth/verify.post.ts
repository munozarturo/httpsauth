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

        if (user.verified)
            return createError({
                statusCode: 400,
                message: "Email already verified.",
            });

        const verificationCode = Math.round(Math.random() * 1000000);
        const verificationCodeHash = await bcrypt.hash(
            verificationCode.toString(),
            10
        );

        const challengeId = await DB.auth.createChallenge({
            userId: user.id,
            verificationCode: verificationCodeHash,
        });

        await sendEmail({
            source: `${DOMAIN} <verification@auth.${DOMAIN}>`,
            destination: { to: email },
            subject: "Verify Your Email Address",
            body: {
                html: `${verificationCode}`,
                text: `${verificationCode}`,
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
