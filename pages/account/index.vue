<template>
	<div
		class="h-full flex flex-col space-y-8 px-8 lg:px-32 py-4 lg:pt-16 text-xl"
	>
		<Logo type="long" />
		<div v-if="auth.context" class="space-y-8">
			<div class="space-y-4 font-normal text-xl">
				<p class="pl-4">
					Here's a quick overview of your account information:
				</p>
				<ul class="pl-10 list-disc">
					<li>
						Your account belongs to
						<span
							class="inline-flex items-center px-2 py-1 rounded-lg text-sm font-bold bg-blue-100 text-blue-800"
						>
							{{ auth.context.user.email }}
						</span>
						and it is
						<span
							:class="[
								'inline-flex items-center px-2 py-1 rounded-lg text-sm font-bold',
								auth.context.user.verified
									? 'bg-green-100 text-green-800'
									: 'bg-red-100 text-red-800',
							]"
						>
							{{
								auth.context.user.verified
									? "verified"
									: "not verified"
							}}
						</span>
					</li>
					<li>
						Your current session was opened
						<span
							class="inline-flex items-center px-2 py-1 rounded-lg text-sm font-bold bg-orange-100 text-orange-800"
						>
							{{
								formatDate(
									auth.context.session.createdAt.toString()
								)
							}}
						</span>
						, it is
						<span
							:class="[
								'inline-flex items-center px-2 py-1 rounded-lg text-sm font-bold',
								auth.context.session.active
									? 'bg-green-100 text-green-800'
									: 'bg-red-100 text-red-800',
							]"
						>
							{{
								auth.context.session.active
									? "active"
									: "inactive"
							}}
						</span>
						and the token is
						<span
							class="inline-flex items-center px-2 py-1 rounded-lg text-sm font-bold bg-purple-100 text-purple-800"
						>
							{{ auth.context.session.token }}
						</span>
					</li>
					<li v-if="otherActiveSessions.length > 0">
						Other active sessions:
						<ul class="list-disc pl-4 mt-2 space-y-2">
							<li
								v-for="session in otherActiveSessions"
								:key="session.token"
								class="text-base"
							>
								Session opened on
								<span
									class="inline-flex items-center px-2 py-1 rounded-lg text-sm font-bold bg-orange-100 text-orange-800"
								>
									{{
										formatDate(session.createdAt.toString())
									}}
								</span>
								with token
								<span
									class="inline-flex items-center px-2 py-1 rounded-lg text-sm font-bold bg-purple-100 text-purple-800"
								>
									{{ session.token }}
								</span>
								and
								<span
									:class="[
										'inline-flex items-center px-2 py-1 rounded-lg text-sm font-bold',
										auth.context.session.active
											? 'bg-green-100 text-green-800'
											: 'bg-red-100 text-red-800',
									]"
								>
									{{
										auth.context.session.active
											? "active"
											: "inactive"
									}}
								</span>
								status
							</li>
						</ul>
					</li>
				</ul>
				<p class="pl-4">Need to make changes? You can...</p>
				<ul class="pl-10 list-disc">
					<li>
						<button
							@click="sendPasswordResetEmail"
							class="underline"
						>
							change your password
						</button>
					</li>
					<li>
						<button @click="signOutAllDevices" class="underline">
							sign out of all devices
						</button>
					</li>
				</ul>
			</div>
		</div>
		<div v-else class="text-2xl">Loading...</div>
	</div>
</template>

<script lang="ts" setup>
definePageMeta({
	middleware: "protected",
});

import { useAuthStore } from "~/stores/auth";
import { useToasterStore } from "~/stores/toaster";

const auth = useAuthStore();
const toaster = useToasterStore();
const isLoading = ref(false);

const formatDate = (dateString: string) => {
	const options: Intl.DateTimeFormatOptions = {
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "numeric",
		minute: "numeric",
	};

	return new Date(dateString).toLocaleDateString(undefined, options);
};

const otherActiveSessions = computed(() => {
	if (!auth.context) return [];

	return auth.context.sessions.filter(
		(session) =>
			session.active && session.token !== auth.context?.session.token
	);
});

const sendPasswordResetEmail = async () => {
	if (!auth.context?.user.email) return;

	try {
		isLoading.value = true;

		await $fetch("/api/auth/reset/password", {
			method: "POST",
			body: { email: auth.context.user.email },
		});

		toaster.addMessage(
			"Password reset email sent. Please check your inbox.",
			"success"
		);
	} catch (e: any) {
		let errorMessage = "An unknown error occurred. Please try again.";

		if (e.data?.statusMessage) errorMessage = e.data.statusMessage;
		if (e.data?.statusCode === 429)
			errorMessage =
				"Too many requests. Please wait and try again later.";

		toaster.addMessage(errorMessage, "error");
	} finally {
		isLoading.value = false;
	}
};

const signOutAllDevices = async () => {
	try {
		isLoading.value = true;

		await $fetch("/api/auth/revoke", { method: "POST" });

		toaster.addMessage(
			"Signed out from all devices successfully.",
			"success"
		);
	} catch (e: any) {
		const errorMessage =
			e.data?.statusMessage ||
			"An error occurred. Please try again later.";
		toaster.addMessage(errorMessage, "error");
	} finally {
		isLoading.value = false;
	}
};
</script>
