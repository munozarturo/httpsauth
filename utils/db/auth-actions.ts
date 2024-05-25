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

const auth = {
    getUser,
    createUser,
};

export default auth;
