import { z } from "zod";

const zodUUID = z.string().uuid();
const zodEmail = z.string().email();
const zodPassword = z.string();
const zodToken = z.string().min(6).max(6);

export { zodUUID, zodEmail, zodPassword, zodToken };
