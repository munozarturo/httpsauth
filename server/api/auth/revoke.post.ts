import DB from "~/utils/db/actions";

export default defineEventHandler(async (event) => {
	try {
		const authContext = event.context.auth;

		if (!authContext)
			return createError({
				statusCode: 400,
				statusMessage: "Unauthorized.",
			});

		const { user, session } = authContext;
		await DB.auth.revokeSessions(user.id, session.token);

		return {
			statusCode: 200,
			statusMessage: "Success.",
		};
	} catch (error: any) {
		console.log(error);

		return createError({
			statusCode: 500,
			statusMessage: "An error occurred. Please try again later.",
		});
	}
});
