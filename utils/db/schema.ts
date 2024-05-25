import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { sql } from "drizzle-orm";

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
    expiresAt: timestamp("expires_at")
        .notNull()
        .default(sql`NOW() + INTERVAL '1 day'`),
});

export const challenges = pgTable("challenges", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
        .notNull()
        .references(() => users.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    expiresAt: timestamp("expires_at")
        .notNull()
        .default(sql`NOW() + INTERVAL '5 minutes'`),
    verificationCode: text("password").notNull(),
    defeated: boolean("defeated").notNull().default(false),
});
