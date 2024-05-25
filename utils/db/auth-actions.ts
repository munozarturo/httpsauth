import * as schema from "~/utils/db/schema";

import { dbClient } from "./client";
import { eq } from "drizzle-orm";

async function getUser(args: {
    email?: string;
    userId?: string;
}): Promise<typeof schema.users.$inferSelect | null> {
    const query = dbClient.select().from(schema.users);

    const { email, userId } = args;

    if (email) query.where(eq(schema.users.email, email));
    if (userId) query.where(eq(schema.users.id, userId));
    const res = await query.execute();

    if (res.length == 0) return null;

    const user = res[0];
    return user;
}

async function createUser(
    user: typeof schema.users.$inferInsert
): Promise<string | null> {
    const res = await dbClient
        .insert(schema.users)
        .values(user)
        .returning({ insertedId: schema.users.id })
        .execute();

    if (res.length == 0) return null;

    const insertedId = res[0].insertedId;
    return insertedId;
}

async function getChallenge(
    id: string
): Promise<typeof schema.challenges.$inferSelect | null> {
    const res = await dbClient
        .select()
        .from(schema.challenges)
        .where(eq(schema.challenges.id, id))
        .execute();

    if (res.length == 0) return null;

    const challenges = res[0];
    return challenges;
}

async function createChallenge(
    challenge: typeof schema.challenges.$inferInsert
): Promise<string | null> {
    const res = await dbClient
        .insert(schema.challenges)
        .values(challenge)
        .returning({ insertedId: schema.challenges.id })
        .execute();

    if (res.length == 0) return null;

    const insertedId = res[0].insertedId;
    return insertedId;
}

async function defeatChallenge(challengeId: string): Promise<string | null> {
    const resUpdateChallenge = await dbClient
        .update(schema.challenges)
        .set({ used: true })
        .where(eq(schema.challenges.id, challengeId))
        .returning({ userId: schema.challenges.userId })
        .execute();

    if (resUpdateChallenge.length == 0) return null;

    const userId = resUpdateChallenge[0].userId;
    return userId;
}

async function verifyUser(userId: string): Promise<void> {
    await dbClient
        .update(schema.users)
        .set({ verified: true })
        .where(eq(schema.users.id, userId))
        .execute();
}

async function resetPassword(
    userId: string,
    passwordHash: string
): Promise<void> {
    await dbClient
        .update(schema.users)
        .set({ passwordHash })
        .where(eq(schema.users.id, userId))
        .execute();
}

async function getSession(
    sessionId: string
): Promise<typeof schema.sessions.$inferSelect | null> {
    const res = await dbClient
        .select()
        .from(schema.sessions)
        .where(eq(schema.sessions.id, sessionId))
        .execute();

    if (res.length == 0) return null;

    const session = res[0];
    return session;
}

async function createSession(
    session: typeof schema.sessions.$inferInsert
): Promise<string | null> {
    const res = await dbClient
        .insert(schema.sessions)
        .values(session)
        .returning({ insertedId: schema.sessions.id })
        .execute();

    if (res.length == 0) return null;

    const insertedId = res[0].insertedId;
    return insertedId;
}

async function closeSession(sessionId: string): Promise<void> {
    await dbClient
        .update(schema.sessions)
        .set({ active: false })
        .where(eq(schema.sessions.id, sessionId));
}

const auth = {
    getUser,
    createUser,
    getChallenge,
    createChallenge,
    defeatChallenge,
    verifyUser,
    resetPassword,
};

export default auth;
