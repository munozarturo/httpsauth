import * as bcrypt from "bcrypt";

import { ZodError, z } from "zod";

import DB from "~/utils/db/actions";
import { sendEmail } from "~/utils/aws/ses";
import { statusMessageFromZodError } from "~/utils/errors/api";
import { zodEmail } from "~/utils/validation/common";

const bodyParser = z.object({
    email: zodEmail,
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
                statusMessage:
                    "An account with this email address does not exist.",
            });

        const token = Math.round(Math.random() * 1000000)
            .toString()
            .padStart(6, "0");
        const tokenHash = await bcrypt.hash(token, 10);

        const challengeId = await DB.auth.createChallenge({
            type: "reset-request",
            userId: user.id,
            tokenHash: tokenHash,
        });

        await sendEmail({
            source: `${DOMAIN} <password-reset@auth.${DOMAIN}>`,
            destination: { to: email },
            subject: "Reset Your Password",
            body: {
                html: `${token}`,
                text: `${token}`,
            },
            replyTo: `contact@${DOMAIN}`,
        });

        return {
            statusCode: 200,
            statusMessage: "Success.",
            challengeId,
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
