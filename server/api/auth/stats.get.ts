import DB from "~/utils/db/actions";

export default defineEventHandler(async () => {
	try {
		const stats = await DB.auth.getStats();

		if (!stats)
			return createError({
				statusCode: 500,
				statusMessage:
					"Error fetching authentication stats. Please try again later.",
			});

		return stats;
	} catch (e: any) {
		return createError({
			statusCode: 500,
			statusMessage: "An error occurred. Please try again later.",
		});
	}
});
