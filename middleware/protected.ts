export default defineNuxtRouteMiddleware(async () => {
	const authStore = useAuthStore();

	const router = useRouter();
	const route = useRoute();

	if (!authStore.context) {
		router.push(`/auth/signin?callback=${route.fullPath}`);
	}
});
