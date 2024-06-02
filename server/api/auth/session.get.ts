import AuthContext from "~/server/middleware/auth";

export default defineEventHandler(async (event) => {
	if (!event.context.auth)
		throw createError({
			statusCode: 403,
			statusMessage: "Unauthorized.",
		});

	return event.context.auth as unknown as typeof AuthContext;
});
