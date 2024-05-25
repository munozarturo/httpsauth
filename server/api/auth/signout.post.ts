import DB from "~/utils/db/actions";

export default defineEventHandler(async (event) => {
    try {
        const sessionToken = getCookie(event, "session-token");

        if (!sessionToken)
            return createError({
                statusCode: 400,
                message: "No session to sign out of.",
            });

        await DB.auth.closeSession(sessionToken);

        setCookie(event, "session-token", "");
        deleteCookie(event, "session-token");

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
