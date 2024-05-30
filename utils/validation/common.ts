import { z } from "zod";

const zodUUID = z.string().uuid();
const zodEmail = z.string().email();
const zodPassword = z.string();
const zodToken = z.string();
const zodLongToken = z.string();

export { zodUUID, zodEmail, zodPassword, zodToken, zodLongToken };
