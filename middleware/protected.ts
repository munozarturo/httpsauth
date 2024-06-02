export default defineNuxtRouteMiddleware(async (to, from) => {
	const authStore = useAuthStore();

	const router = useRouter();

	onNuxtReady(() => {
		if (!authStore.context) {
			router.push(`/auth/signin?callback=${from.fullPath}`);
		}
	});
});
