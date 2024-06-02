<template>
	<div class="flex items-center justify-center min-h-screen bg-gray-100">
		<div class="bg-white p-8 rounded-lg shadow-md">
			<h2 class="text-2xl font-bold mb-6 text-center">Sign Up</h2>
			<Form
				@submit="submitForm"
				:validation-schema="validationSchema"
				class="space-y-2"
			>
				<div>
					<label
						for="email"
						class="block text-gray-700 font-bold mb-2"
						>Email</label
					>
					<Field
						type="email"
						id="email"
						name="email"
						class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
					/>
					<ErrorMessage
						name="email"
						class="mt-2 px-2 py-2 rounded-md"
					/>
				</div>
				<div>
					<NewPasswordInput
						id="password"
						name="password"
						label="Password"
						:value="password"
						@update:value="password = $event"
					/>
					<ErrorMessage
						name="password"
						class="mt-2 px-2 py-2 rounded-md"
					/>
				</div>
				<div v-if="errorMessage" class="mt-2 px-2 py-2 rounded-md">
					{{ errorMessage }}
				</div>
				<button
					type="submit"
					class="w-full bg-black text-white font-bold py-2 px-4 rounded-md hover:bg-gray-800"
				>
					Sign Up
				</button>
			</Form>
			<div class="mt-6 flex items-center">
				<div class="border-t border-gray-300 flex-grow mr-3"></div>
				<div class="text-gray-600">or</div>
				<div class="border-t border-gray-300 flex-grow ml-3"></div>
			</div>
			<div class="mt-6 text-center">
				<a
					href="/auth/signin"
					class="text-black font-bold hover:underline"
					>Sign In</a
				>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
definePageMeta({
	layout: "auth",
});

import { Form, Field, ErrorMessage, useField } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as zod from "zod";
import { useRouter } from "vue-router";
import type { APIError } from "~/utils/errors/api";
import { useToasterStore } from "~/stores/toaster";
import { zodEmail, zodPassword } from "~/utils/validation/common";

const toasterStore = useToasterStore();
const route = useRoute();
const router = useRouter();

const errorMessage = ref<string>("");

const redirect = ref<string>("");
redirect.value = route.query.redirect as string;

const zodSchema = zod.object({
	email: zodEmail,
	password: zodPassword,
});

const validationSchema = toTypedSchema(zodSchema);
type FormValues = zod.infer<typeof zodSchema>;

const { value: password } = useField<string>("password");

const submitForm = async (input: Record<string, unknown>) => {
	const form = input as FormValues;

	const verifyUrl = computed(() => {
		if (redirect.value)
			return `/auth/verify?email=${form.email}&redirect=${redirect.value}`;
		return `/auth/verify?email=${form.email}`;
	});

	try {
		await $fetch("/api/auth/signup", {
			method: "POST",
			body: {
				email: form.email,
				password: form.password,
			},
		});

		toasterStore.addMessage("Account registered", "success");

		router.push(verifyUrl.value);
	} catch (e: any) {
		if (!e.data)
			errorMessage.value = "An unknown error occurred. Please try again.";

		const error = e as unknown as APIError;
		errorMessage.value = error.statusMessage;
	}
};
</script>
