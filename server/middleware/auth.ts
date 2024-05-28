import DB from "~/utils/db/actions";

export interface AuthContext {
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

                const authContext: AuthContext = {
                    user,
                    session: {
                        ...session,
                        token,
                    },
                };

                event.context.auth = authContext;
            }
        }
    }
});
