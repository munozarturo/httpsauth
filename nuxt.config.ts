// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	devtools: { enabled: true },
	modules: ["@nuxtjs/tailwindcss", "@pinia/nuxt", "@vue-email/nuxt"],
	runtimeConfig: {
		auth: {
			verificationCodeExpiryTimeMs: 60 * 5 * 1000, // 5 minutes (ms)
			resetCodeExpiryTimeMs: 60 * 5 * 1000, // 5 minutes (ms)
			verificationCommunicationRateLimitMs: 60 * 1000, // 1 communication per minute (ms)
		},
	},
});
