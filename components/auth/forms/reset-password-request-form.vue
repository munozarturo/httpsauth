<template>
	<div v-if="!emailSent && !challenge">
		<Form
			@submit="submitEmail"
			:validation-schema="emailValidationSchema"
			class="space-y-2"
		>
			<div>
				<label for="email" class="block text-gray-700 font-bold mb-2"
					>Email</label
				>
				<Field
					type="email"
					id="email"
					name="email"
					class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
				/>
				<ErrorMessage name="email" class="mt-2 px-2 py-2 rounded-md" />
			</div>
			<button
				type="submit"
				class="w-full bg-black text-white font-bold py-2 px-4 rounded-md hover:bg-gray-800"
			>
				Submit
			</button>
		</Form>
		<p v-if="errorMessage" class="mt-4 text-center">
			{{ errorMessage }}
		</p>
	</div>
	<div v-else-if="emailSent">
		<p class="text-center text-gray-700">
			If there is an account associated with the provided email address,
			we have sent an email with account recovery instructions.
		</p>
	</div>
	<div v-else-if="challenge && token">
		<Form
			@submit="submitReset"
			:validation-schema="resetValidationSchema"
			class="space-y-2"
		>
			<NewPasswordInput
				id="password"
				name="password"
				label="New Password"
				:value="password"
				@update:value="password = $event"
			/>
			<!-- <ErrorMessage
						name="password"
						class="mt-2 px-2 py-2 rounded-md"
					/> -->
			<button
				type="submit"
				class="w-full bg-black text-white font-bold py-2 px-4 rounded-md hover:bg-gray-800"
			>
				Reset Password
			</button>
		</Form>
		<p v-if="errorMessage" class="mt-4 text-center">
			{{ errorMessage }}
		</p>
	</div>
</template>

<script setup lang="ts">
definePageMeta({
	layout: "auth",
});

import { Form, Field, ErrorMessage, useField } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as zod from "zod";
import { useRoute, useRouter } from "vue-router";
import type { APIError } from "~/utils/errors/api";
import { useToasterStore } from "~/stores/toaster";
import { zodEmail, zodPassword } from "~/utils/validation/common";

const toasterStore = useToasterStore();
const route = useRoute();
const router = useRouter();

const emailSent = ref<boolean>(false);
const errorMessage = ref(<string>"");

const challenge = ref<string>("");
challenge.value = route.query.challenge as string;

const token = ref<string>("");
token.value = route.query.token as string;

const redirect = ref<string>("");
redirect.value = route.query.redirect as string;

const forwardUrl = computed(() => {
	if (redirect.value) return `/auth/signin?redirect=${redirect.value}`;
	return "/auth/signin";
});

const emailZodSchema = zod.object({
	email: zodEmail,
});

const emailValidationSchema = toTypedSchema(emailZodSchema);
type EmailFormValues = zod.infer<typeof emailZodSchema>;

const submitEmail = async (input: Record<string, unknown>) => {
	const form = input as EmailFormValues;

	try {
		await $fetch("/api/auth/reset", {
			method: "POST",
			body: { email: form.email, redirect: redirect.value },
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

const resetZodSchema = zod.object({
	password: zodPassword,
});

const resetValidationSchema = toTypedSchema(resetZodSchema);
type ResetFormValues = zod.infer<typeof resetZodSchema>;

const { value: password } = useField<string>("password");

const submitReset = async (input: Record<string, unknown>) => {
	const form = input as ResetFormValues;

	try {
		await $fetch("/api/auth/reset/confirm", {
			method: "POST",
			body: {
				challengeId: challenge.value,
				token: token.value,
				password: form.password,
			},
		});

		toasterStore.addMessage("Password reset", "success");
		errorMessage.value = "";

		router.push(forwardUrl.value);
	} catch (e: any) {
		if (!e.data)
			errorMessage.value = "An unknown error occurred. Please try again.";

		const error = e as unknown as APIError;
		errorMessage.value = error.statusMessage;
	}
};
</script>