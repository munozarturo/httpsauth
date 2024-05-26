import * as bcrypt from "bcrypt";

import { zodEmail, zodPassword } from "~/utils/validation/common";

import DB from "~/utils/db/actions";
import { z } from "zod";

const bodyParser = z.object({
    email: zodEmail,
    password: zodPassword,
});

export default defineEventHandler(async (event) => {
    const body = await readBody(event);

    try {
        const { email, password } = bodyParser.parse(body);

        const user = await DB.auth.getUser({ email });
        if (!user || !(await bcrypt.compare(password, user.passwordHash)))
            return createError({
                statusCode: 400,
                statusMessage: "Incorrect email or password.",
            });

        const oldSessionToken = getCookie(event, "session-token") || null;
        if (oldSessionToken) await DB.auth.closeSession(oldSessionToken);

        const sessionToken = await DB.auth.createSession({ userId: user.id });
        if (!sessionToken)
            return createError({
                statusCode: 500,
                statusMessage: "Failed to create session.",
            });

        setCookie(event, "session-token", sessionToken);

        return {
            message: "Success.",
        };
    } catch (error: any) {
        console.log(error);

        return createError({
            statusCode: 500,
            statusMessage: "Internal Server Error.",
        });
    }
});
