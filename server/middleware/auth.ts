import DB from "~/utils/db/actions";

export type AuthContext = {
    user: {
        id: string;
        email: string;
        verified: boolean;
    };
    session: {
        token: string;
        active: boolean;
        createdAt: Date;
    };
} | null;

// explicit type declaration event.context.auth
declare module "h3" {
    interface H3EventContext {
        auth: AuthContext;
    }
}

export default defineEventHandler(async (event) => {
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
            } else {
                event.context.auth = null;
            }
        }
    }
});
