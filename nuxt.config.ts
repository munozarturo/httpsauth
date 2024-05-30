// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	devtools: { enabled: true },
	modules: ["@nuxtjs/tailwindcss", "@pinia/nuxt", "@vue-email/nuxt"],
	runtimeConfig: {
		auth: {
			verificationCodeExpiryTimeMs: 60 * 5 * 1000, // 5 minutes (ms)
			resetCodeExpiryTimeMs: 60 * 5 * 1000, // 5 minutes (ms)
			verificationCommunicationRateLimitMs: 60 * 1000, // 1 communication per minute (ms)
			sessionExpiryTimeMs: 7 * 24 * 60 * 60 * 1000, // 7 days
			sessionRefreshThresholdMs: 2 * 24 * 60 * 60 * 1000, // 2 days
		},
	},
});
