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
                message: "Incorrect email or password.",
            });

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
