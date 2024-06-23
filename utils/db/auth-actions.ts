import * as schema from "~/utils/db/schema";

import { and, count, eq, gt, ne } from "drizzle-orm";

import { dbClient } from "./client";

type AuthContext = {
	user: {
		id: string;
		email: string;
		verified: boolean;
	};
	session: {
		token: string;
		active: boolean;
		revoked: boolean;
		createdAt: Date;
	};
	sessions: {
		token: string;
		active: boolean;
		revoked: boolean;
		createdAt: Date;
	}[];
} | null;

async function getUser(args: {
	email?: string;
	userId?: string;
}): Promise<typeof schema.users.$inferSelect | null> {
	const query = dbClient.select().from(schema.users);

	const { email, userId } = args;

	if (!email && !userId) return null;
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

async function attemptChallenge(challengeId: string): Promise<string | null> {
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

async function getDecomissinedPasswords(
	userId: string
): Promise<{ passwordHash: string; decomissionedAt: Date }[] | null> {
	const res = await dbClient
		.select({
			passwordHash: schema.decomissionedPasswords.passwordHash,
			decomissionedAt: schema.decomissionedPasswords.decomissionedAt,
		})
		.from(schema.decomissionedPasswords)
		.where(eq(schema.decomissionedPasswords.userId, userId))
		.execute();

	return res;
}

async function resetPassword(
	userId: string,
	passwordHash: string
): Promise<void> {
	const user = await getUser({ userId });

	if (!user) return;
	const { passwordHash: oldPasswordHash } = user;

	await dbClient
		.update(schema.users)
		.set({ passwordHash })
		.where(eq(schema.users.id, userId))
		.execute();

	await dbClient
		.insert(schema.decomissionedPasswords)
		.values({ userId, passwordHash: oldPasswordHash })
		.execute();
}

async function getSession(sessionId: string): Promise<AuthContext> {
	const res = await dbClient
		.select({
			userId: schema.users.id,
			email: schema.users.email,
			verified: schema.users.verified,
			sessionToken: schema.sessions.id,
			active: schema.sessions.active,
			revoked: schema.sessions.revoked,
			createdAt: schema.sessions.createdAt,
		})
		.from(schema.sessions)
		.innerJoin(schema.users, eq(schema.sessions.userId, schema.users.id))
		.where(eq(schema.sessions.id, sessionId))
		.execute();

	if (res.length === 0) return null;

	const {
		userId,
		email,
		verified,
		sessionToken,
		active,
		revoked,
		createdAt,
	} = res[0];

	const activeSessions = await dbClient
		.select({
			token: schema.sessions.id,
			active: schema.sessions.active,
			revoked: schema.sessions.revoked,
			createdAt: schema.sessions.createdAt,
		})
		.from(schema.sessions)
		.where(
			and(
				ne(schema.sessions.id, sessionToken),
				and(
					eq(schema.sessions.userId, userId),
					and(
						eq(schema.sessions.revoked, false),
						eq(schema.sessions.active, true)
					)
				)
			)
		)
		.execute();

	return {
		user: {
			id: userId,
			email,
			verified,
		},
		session: {
			token: sessionToken,
			revoked,
			active,
			createdAt,
		},
		sessions: activeSessions,
	};
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

async function closeSession(sessionId: string): Promise<string | null> {
	const res = await dbClient
		.update(schema.sessions)
		.set({ active: false })
		.where(eq(schema.sessions.id, sessionId))
		.returning({ userId: schema.sessions.userId })
		.execute();

	if (res.length == 0) return null;

	const userId = res[0].userId;
	return userId;
}

async function refreshSession(sessionId: string): Promise<string | null> {
	const userId = await closeSession(sessionId);
	if (!userId) return null;

	return await createSession({ userId });
}

async function revokeSessions(
	userId: string,
	exclude?: string
): Promise<string[] | null> {
	const res = await dbClient
		.update(schema.sessions)
		.set({ active: false, revoked: true })
		.where(
			and(
				eq(schema.sessions.userId, userId),
				exclude ? ne(schema.sessions.id, exclude) : undefined
			)
		)
		.returning({ sessionId: schema.sessions.id })
		.execute();

	if (res.length == 0) return null;

	const closedSessions = res.map((val) => val.sessionId);
	return closedSessions;
}

async function logCommunication(
	communication: typeof schema.communications.$inferInsert
): Promise<string | null> {
	const res = await dbClient
		.insert(schema.communications)
		.values(communication)
		.returning({ insertedId: schema.communications.id })
		.execute();

	if (res.length == 0) return null;

	const insertedId = res[0].insertedId;
	return insertedId;
}

async function getCommunications(args: {
	to: string;
	fromTimestamp: Date;
	// not sure how to get enum types some other way
	type: (typeof schema.communications)["_"]["columns"]["type"]["_"]["enumValues"][number];
}): Promise<(typeof schema.communications.$inferSelect)[]> {
	const { to, fromTimestamp, type } = args;

	const res = await dbClient
		.select()
		.from(schema.communications)
		.where(
			and(
				eq(schema.communications.to, to),
				and(
					eq(schema.communications.type, type),
					gt(schema.communications.sentAt, fromTimestamp)
				)
			)
		)
		.execute();

	return res;
}

async function getStats(): Promise<{
	registeredUsers: number | null;
	verifiedUsers: number | null;
	activeSessions: number | null;
	closedSessions: number | null;
	passwordResets: number | null;
}> {
	const registeredUsersResult = await dbClient
		.select({ count: count() })
		.from(schema.users);
	const registeredUsers = registeredUsersResult[0]?.count ?? null;

	const verifiedUsersResult = await dbClient
		.select({ count: count() })
		.from(schema.users)
		.where(eq(schema.users.verified, true));
	const verifiedUsers = verifiedUsersResult[0]?.count ?? null;

	const activeSessionsResult = await dbClient
		.select({ count: count() })
		.from(schema.sessions)
		.where(eq(schema.sessions.active, true));
	const activeSessions = activeSessionsResult[0]?.count ?? null;

	const closedSessionsResult = await dbClient
		.select({ count: count() })
		.from(schema.sessions)
		.where(eq(schema.sessions.active, false));
	const closedSessions = closedSessionsResult[0]?.count ?? null;

	const passwordResetsResult = await dbClient
		.select({ count: count() })
		.from(schema.challenges)
		.where(
			and(
				eq(schema.challenges.type, "password-reset"),
				eq(schema.challenges.used, true)
			)
		);
	const passwordResets = passwordResetsResult[0]?.count ?? null;

	return {
		registeredUsers,
		verifiedUsers,
		activeSessions,
		closedSessions,
		passwordResets,
	};
}

const auth = {
	getUser,
	createUser,
	getChallenge,
	createChallenge,
	attemptChallenge,
	verifyUser,
	getDecomissinedPasswords,
	resetPassword,
	getSession,
	createSession,
	closeSession,
	revokeSessions,
	refreshSession,
	logCommunication,
	getCommunications,
	getStats,
};

export default auth;

export { type AuthContext };
