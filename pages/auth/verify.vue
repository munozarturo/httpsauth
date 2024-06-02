<template>
	<div class="flex items-center justify-center min-h-screen bg-gray-100">
		<div class="bg-white p-8 rounded-lg shadow-md">
			<h2 class="text-2xl font-bold mb-6 text-center">Verify</h2>
			<div v-if="!challenge">
				<p v-if="errorMessage" class="mt-4 text-center">
					{{ errorMessage }}
				</p>
				<p
					v-else-if="retryTimer > 0"
					class="mt-4 text-center text-gray-600"
				>
					There has been an error, trying again in
					{{ retryTimer }} seconds.
				</p>
				<p v-else class="text-center text-gray-600">
					Sending Verification Code...
				</p>
			</div>
			<div v-else>
				<p class="text-center text-gray-700 mb-4">
					Enter the verification code sent to your email.
				</p>
				<VerificationCodeInput @submit="submitVerificationCode" />
				<p v-if="errorMessage" class="mt-4 text-center">
					{{ errorMessage }}
				</p>
				<div class="text-center mt-4">
					<button
						v-if="timer > 0"
						class="text-sm text-gray-600"
						disabled
					>
						Resend code in {{ timer }} seconds
					</button>
					<button
						v-else
						class="text-sm text-gray-600 hover:text-gray-800"
						@click="resendVerificationCode"
					>
						Resend code?
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
definePageMeta({
	layout: "auth",
});

import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { APIError } from "~/utils/errors/api";
import { useToasterStore } from "~/stores/toaster";

const toasterStore = useToasterStore();

const route = useRoute();
const router = useRouter();
const email = ref("");
const challenge = ref("");
const errorMessage = ref("");
const timer = ref(0);
const timerInterval = ref<NodeJS.Timeout | null>(null);
const retryTimer = ref(0);
const retryTimerInterval = ref<NodeJS.Timeout | null>(null);

const redirect = ref("");
redirect.value = route.query.redirect as string;

const forwardUrl = computed(() => {
	if (redirect.value) return `/auth/signin?redirect=${redirect.value}`;
	return "/auth/signin";
});

onMounted(async () => {
	email.value = route.query.email as string;
	if (email.value) {
		await sendVerificationCode();
	} else {
		challenge.value = route.query.challenge as string;
	}
});

const sendVerificationCode = async () => {
	try {
		const res = await $fetch<{ challengeId: string }>("/api/auth/verify", {
			method: "POST",
			body: { email: email.value },
		});

		challenge.value = res.challengeId;
		router.replace({
			query: { challenge: challenge.value },
		});

		toasterStore.addMessage(
			"We sent a verification code to your email address",
			"info"
		);

		startTimer();
	} catch (e: any) {
		if (!e.data)
			errorMessage.value = "An unknown error occurred. Please try again.";

		const error = e as unknown as APIError;
		if (error.statusCode === 429) {
			startRetryTimer();
		} else if (error.statusCode === 409) {
			toasterStore.addMessage("Email already verified", "success");

			router.push(forwardUrl.value);
		} else {
			errorMessage.value = error.statusMessage;
		}
	}
};

const startTimer = () => {
	// auth.verificationCommunicationRateLimitMs
	timer.value = 60;
	timerInterval.value = setInterval(() => {
		timer.value--;
		if (timer.value === 0) {
			clearInterval(timerInterval.value!);
		}
	}, 1000);
};

const startRetryTimer = () => {
	// auth.verificationCommunicationRateLimitMs
	retryTimer.value = 60;
	retryTimerInterval.value = setInterval(() => {
		retryTimer.value--;
		if (retryTimer.value === 0) {
			clearInterval(retryTimerInterval.value!);
			resendVerificationCode();
		}
	}, 1000);
};

const resendVerificationCode = async () => {
	await sendVerificationCode();
};

const submitVerificationCode = async (code: string) => {
	try {
		await $fetch("/api/auth/verify/confirm", {
			method: "POST",
			body: {
				challengeId: challenge.value,
				token: code,
			},
		});

		toasterStore.addMessage("Account verified", "success");

		router.push(forwardUrl.value);
	} catch (e: any) {
		if (!e.data)
			errorMessage.value = "An unknown error occurred. Please try again.";

		const error = e as unknown as APIError;
		errorMessage.value = error.statusMessage;
	}
};
</script>
