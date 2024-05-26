<template>
    <div class="flex items-center justify-center min-h-screen bg-gray-100">
        <div class="bg-white p-8 rounded-lg shadow-md">
            <h2 class="text-2xl font-bold mb-6 text-center">Sign Up</h2>
            <form @submit.prevent="submitForm" class="space-y-2">
                <div>
                    <label for="email" class="block text-gray-700 font-bold mb-2">Email</label>
                    <input type="email" id="email" v-model="form.email" required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent" />
                </div>
                <div>
                    <label for="password" class="block text-gray-700 font-bold mb-2">Password</label>
                    <input type="password" id="password" v-model="form.password" required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent" />
                </div>
                <div>
                    <label for="confirmPassword" class="block text-gray-700 font-bold mb-2">Confirm Password</label>
                    <input type="password" id="confirmPassword" v-model="form.confirmPassword" required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent" />
                </div>
                <div v-if="errorMessage" class="mt-2 px-2 py-2 rounded-md">
                    {{ errorMessage }}
                </div>
                <button type="submit"
                    class="w-full bg-black text-white font-bold py-2 px-4 rounded-md hover:bg-gray-800">
                    Sign Up
                </button>
            </form>
            <div class="mt-6 flex items-center">
                <div class="border-t border-gray-300 flex-grow mr-3"></div>
                <div class="text-gray-600">or</div>
                <div class="border-t border-gray-300 flex-grow ml-3"></div>
            </div>
            <div class="mt-6 text-center">
                <a href="/auth/signin" class="text-black font-bold hover:underline">Sign In</a>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import type { APIError } from "~/utils/errors/api";

const router = useRouter();
const form = ref<{
    email: string;
    password: string;
    confirmPassword: string;
}>({
    email: "",
    password: "",
    confirmPassword: "",
});
const errorMessage = ref<string>("");

const submitForm = async () => {
    if (form.value.password !== form.value.confirmPassword) {
        errorMessage.value = "Passwords do not match.";
        return;
    }

    try {
        await $fetch("/api/auth/signup", {
            method: "POST",
            body: {
                email: form.value.email,
                password: form.value.password
            },
        });

        router.push(`/auth/verify?email=${form.value.email}`);
    } catch (e: any) {
        if (!e.data) errorMessage.value = "An unknown error occurred. Please try again.";

        const error = e as unknown as APIError;
        errorMessage.value = error.statusMessage;
    }
};
</script>