<template>
	<div class="flex items-center justify-center min-h-screen bg-gray-100">
		<div class="bg-white p-8 rounded-lg shadow-md">
			<h2 class="text-2xl font-bold mb-6 text-center">Reset Password</h2>
			<div v-if="!emailSent && !challenge">
				<form @submit.prevent="submitEmail" class="space-y-2">
					<div>
						<label
							for="email"
							class="block text-gray-700 font-bold mb-2"
							>Email</label
						>
						<input
							type="email"
							id="email"
							v-model="form.email"
							required
							class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
						/>
					</div>
					<button
						type="submit"
						class="w-full bg-black text-white font-bold py-2 px-4 rounded-md hover:bg-gray-800"
					>
						Submit
					</button>
				</form>
				<p v-if="errorMessage" class="mt-4 text-center">
					{{ errorMessage }}
				</p>
			</div>
			<div v-else-if="emailSent">
				<p class="text-center text-gray-700">
					If there is an account associated with the provided email
					address, we have sent an email with account recovery
					instructions.
				</p>
			</div>
			<div v-else-if="challenge && token">
				<form @submit.prevent="submitReset" class="space-y-2">
					<div>
						<label
							for="password"
							class="block text-gray-700 font-bold mb-2"
							>New Password</label
						>
						<PasswordInput id="password" v-model="form.password" />
					</div>
					<div>
						<label
							for="confirmPassword"
							class="block text-gray-700 font-bold mb-2"
							>Confirm Password</label
						>
						<PasswordInput
							id="confirmPassword"
							v-model="form.confirmPassword"
						/>
					</div>
					<button
						type="submit"
						class="w-full bg-black text-white font-bold py-2 px-4 rounded-md hover:bg-gray-800"
					>
						Reset Password
					</button>
				</form>
				<p v-if="errorMessage" class="mt-4 text-center">
					{{ errorMessage }}
				</p>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
definePageMeta({
	layout: "auth",
});

import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { APIError } from "~/utils/errors/api";
import { useToasterStore } from "~/stores/toaster";

const toasterStore = useToasterStore();

interface FormData {
	email: string;
	password: string;
	confirmPassword: string;
}

const route = useRoute();
const router = useRouter();
const form = ref<FormData>({
	email: "",
	password: "",
	confirmPassword: "",
});
const emailSent = ref(false);
const errorMessage = ref("");
const challenge = ref("");
const token = ref("");

const submitEmail = async () => {
	try {
		await $fetch("/api/auth/reset", {
			method: "POST",
			body: { email: form.value.email },
		});

		emailSent.value = true;
		errorMessage.value = "";
	} catch (e: any) {
		if (!e.data)
			errorMessage.value = "An unknown error occurred. Please try again.";

		const error = e as unknown as APIError;
		if (error.statusCode === 429) {
			errorMessage.value =
				"Too many requests. Please wait and try again later.";
		} else {
			errorMessage.value = error.statusMessage;
		}
	}
};

const submitReset = async () => {
	if (form.value.password !== form.value.confirmPassword) {
		errorMessage.value = "Passwords do not match.";
		return;
	}

	try {
		await $fetch("/api/auth/reset/confirm", {
			method: "POST",
			body: {
				challengeId: challenge.value,
				token: token.value,
				password: form.value.password,
			},
		});

		toasterStore.addMessage("Password reset", "success");
		errorMessage.value = "";
		router.push("/auth/signin");
	} catch (e: any) {
		if (!e.data)
			errorMessage.value = "An unknown error occurred. Please try again.";

		const error = e as unknown as APIError;
		errorMessage.value = error.statusMessage;
	}
};

// Check if challenge and token exist in the URL query params
challenge.value = route.query.challenge as string;
token.value = route.query.token as string;
</script>
