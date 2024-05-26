import DB from "~/utils/db/actions";
import { defineNuxtRouteMiddleware } from "nuxt/app";

export default defineNuxtRouteMiddleware(async (event) => {
    const sessionToken = getCookie(event, "session-token");

    if (sessionToken) {
        const sessionData = await DB.auth.getSession(sessionToken);
        const userId = sessionData?.userId;

        if (userId) {
            const userData = await DB.auth.getUser({ userId });

            if (sessionData && userData) {
                const { userId, id: token, ...session } = sessionData;
                const { passwordHash, ...user } = userData;

                event.context.auth = {
                    user,
                    session: {
                        ...session,
                        token,
                    },
                };
            }
        }
    }
});
