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

        const emailInUse = await DB.auth.getUser({ email });
        if (emailInUse)
            return createError({
                statusCode: 400,
                message: "Email in use.",
            });

        const passwordHash = await bcrypt.hash(password, 10);

        await DB.auth.createUser({ email, passwordHash });

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
