import { useCompiler } from "#vue-email";

export default defineEventHandler(async (event) => {
    const body: { html: string; text: string } = await useCompiler(
        "reset-password.vue",
        {
            props: {
                token: "123123",
                communicationId: "e8f5d6e1-5c4d-4f3a-9a7b-1c2d3e4f5a6b",
            },
        }
    );

    return {
        data: event.context.auth,
    };
});
