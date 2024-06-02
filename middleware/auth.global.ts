import type AuthContext from "~/server/middleware/auth";
import { useAuthStore } from "~/stores/auth";

export default defineNuxtRouteMiddleware(async () => {
	const authStore = useAuthStore();

	if (!authStore.context) {
		try {
			const context = await $fetch<typeof AuthContext>(
				"/api/auth/session"
			);
			authStore.setAuthContext(context);
		} catch (error) {
			console.error("Failed to fetch auth context.", error);
		}
	}
});
