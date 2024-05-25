import {
    boolean,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(),
    password: text("password").notNull(),
    verified: boolean("verified").notNull().default(false),
});

export const sessions = pgTable("sessions", {
    id: uuid("id").primaryKey().defaultRandom(),
    valid: boolean("valid").notNull().default(true),
    userId: uuid("user_id")
        .notNull()
        .references(() => users.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const challengeType = pgEnum("challenge_type", [
    "verification",
    "reset",
]);

export const challenges = pgTable("challenges", {
    id: uuid("id").primaryKey().defaultRandom(),
    type: challengeType("challenge_type").notNull(),
    userId: uuid("user_id")
        .notNull()
        .references(() => users.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    verificationCode: text("password").notNull(),
    defeated: boolean("defeated").notNull().default(false),
});
