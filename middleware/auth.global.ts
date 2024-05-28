import type { AuthContext } from "~/server/middleware/auth";
import { useAuthStore } from "~/stores/auth";

export default defineNuxtRouteMiddleware(async () => {
    const authStore = useAuthStore();

    if (!authStore.context) {
        try {
            console.log("populating auth store");
            const authContext = await $fetch<AuthContext>("/api/auth/session");
            authStore.setAuthContext(authContext);
        } catch (error) {
            console.error("Failed to fetch auth context:", error);
        }
    }
});
