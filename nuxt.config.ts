// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    devtools: { enabled: true },
    modules: ["@nuxtjs/tailwindcss"],
    runtimeConfig: {
        auth: {
            verificationCodeExpiryTime: 60 * 5 * 1000, // 5 minutes (ms)
            resetCodeExpiryTime: 60 * 5 * 1000, // 5 minutes (ms)
        },
    },
});
