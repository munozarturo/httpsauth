export default defineEventHandler(async (event) => {
    return {
        data: event.context.auth,
    };
});
