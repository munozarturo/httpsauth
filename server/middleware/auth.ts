export default defineEventHandler((event) => {
    event.context.auth = {
        session: null,
    };
});
