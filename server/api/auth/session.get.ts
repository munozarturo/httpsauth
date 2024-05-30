export default defineEventHandler(async (event) => {
	if (!event.context.auth)
		return createError({
			statusCode: 403,
			statusMessage: "Unauthorized.",
		});

	return event.context.auth;
});
