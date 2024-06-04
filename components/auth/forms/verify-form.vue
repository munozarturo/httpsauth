<template>
	<div v-if="!challenge">
		<p v-if="errorMessage" class="mt-4 text-center">
			{{ errorMessage }}
		</p>
		<p v-else-if="retryTimer > 0" class="mt-4 text-center text-gray-600">
			There has been an error, trying again in
			{{ retryTimer }} seconds.
		</p>
		<p v-else class="text-center text-gray-600">
			Sending Verification Token...
		</p>
	</div>
	<div v-else>
		<p class="text-left text-gray-700 mb-4">
			Enter the verification token sent to your email.
		</p>
		<Form @submit="submitForm" :validation-schema="validationSchema">
			<Field name="token" v-slot="{ field }">
				<VerificationTokenInput v-bind="field" @complete="submitForm" />
			</Field>
			<ErrorMessage name="token" class="mt-2 text-center text-red-600" />
			<button
				type="submit"
				class="mt-4 w-full bg-black text-white font-bold py-2 px-4 rounded-md hover:bg-gray-800"
			>
				Verify
			</button>
		</Form>
		<p v-if="errorMessage" class="mt-4 text-center">
			{{ errorMessage }}
		</p>
		<div class="text-center mt-4">
			<button v-if="timer > 0" class="text-sm text-gray-600" disabled>
				Resend token in {{ timer }} seconds
			</button>
			<button
				v-else
				class="text-sm text-gray-600 hover:text-gray-800"
				@click="resendVerificationToken"
			>
				Resend token?
			</button>
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
import { Form, Field, ErrorMessage } from "vee-validate";
import * as zod from "zod";
import { toTypedSchema } from "@vee-validate/zod";
import { zodToken } from "~/utils/validation/common";

const toasterStore = useToasterStore();
const route = useRoute();
const router = useRouter();

const email = ref<string>("");
const challenge = ref<string>("");
const errorMessage = ref<string>("");

const timer = ref<number>(0);
const timerInterval = ref<NodeJS.Timeout | null>(null);

const retryTimer = ref<number>(0);
const retryTimerInterval = ref<NodeJS.Timeout | null>(null);

const redirect = ref<string>("");
redirect.value = route.query.redirect as string;

const forwardUrl = computed(() => {
	if (redirect.value) return `/auth/signin?redirect=${redirect.value}`;
	return "/auth/signin";
});

const zodSchema = zod.object({
	token: zodToken,
});

const validationSchema = toTypedSchema(zodSchema);
type FormValues = zod.infer<typeof zodSchema>;

onMounted(async () => {
	email.value = route.query.email as string;
	if (email.value) {
		await sendVerificationToken();
	} else {
		challenge.value = route.query.challenge as string;
	}
});

const sendVerificationToken = async () => {
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
			"We sent a verification token to your email address",
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
			resendVerificationToken();
		}
	}, 1000);
};

const resendVerificationToken = async () => {
	await sendVerificationToken();
};

const submitForm = async (input: Record<string, unknown>) => {
	const form = input as FormValues;

	try {
		await useFetch("/api/auth/verify/confirm", {
			method: "POST",
			body: {
				challengeId: challenge.value,
				token: form.token,
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
