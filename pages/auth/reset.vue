<template>
    <div class="flex items-center justify-center min-h-screen bg-gray-100">
        <div class="bg-white p-8 rounded-lg shadow-md">
            <h2 class="text-2xl font-bold mb-6 text-center">Reset Password</h2>
            <div v-if="!challenge">
                <form @submit.prevent="submitEmail" class="space-y-2">
                    <div>
                        <label for="email" class="block text-gray-700 font-bold mb-2">Email</label>
                        <input type="email" id="email" v-model="form.email" required
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent" />
                    </div>
                    <button type="submit"
                        class="w-full bg-black text-white font-bold py-2 px-4 rounded-md hover:bg-gray-800">
                        Submit
                    </button>
                </form>
            </div>
            <div v-else-if="!resetToken">
                <p class="text-center text-gray-700 mb-4">Enter the verification code sent to your email.</p>
                <VerificationCodeInput @submit="submitVerificationCode" />
            </div>
            <div v-else>
                <form @submit.prevent="submitReset" class="space-y-2">
                    <div>
                        <label for="password" class="block text-gray-700 font-bold mb-2">New Password</label>
                        <PasswordInput id="password" v-model="form.password" />
                    </div>
                    <div>
                        <label for="confirmPassword" class="block text-gray-700 font-bold mb-2">Confirm Password</label>
                        <PasswordInput id="confirmPassword" v-model="form.confirmPassword" />
                    </div>
                    <button type="submit"
                        class="w-full bg-black text-white font-bold py-2 px-4 rounded-md hover:bg-gray-800">
                        Reset Password
                    </button>
                </form>
            </div>
            <p v-if="errorMessage" class="mt-4 text-center">{{ errorMessage }}</p>
        </div>
    </div>
</template>

<script setup lang="ts">
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
const challenge = ref("");
const resetToken = ref("");
const errorMessage = ref("");

const submitEmail = async () => {
    try {
        const res = await $fetch<{ challengeId: string }>("/api/auth/reset", {
            method: "POST",
            body: { email: form.value.email },
        });
        challenge.value = res.challengeId;
        router.replace({ query: { challenge: challenge.value } });

        toasterStore.addMessage("We sent a verification code to your email address", "info");
    } catch (e: any) {
        if (!e.data) errorMessage.value = "An unknown error occurred. Please try again.";

        const error = e as unknown as APIError;
        errorMessage.value = error.statusMessage;
    }
};

const submitVerificationCode = async (code: string) => {
    try {
        const res = await $fetch<{ resetToken: string; challengeId: string }>("/api/auth/reset/verify", {
            method: "POST",
            body: {
                challengeId: challenge.value,
                token: code,
            },
        });
        resetToken.value = res.resetToken;
        challenge.value = res.challengeId;
        router.replace({ query: { challenge: challenge.value, "reset-token": resetToken.value } });

        toasterStore.addMessage("Identity verified", "success");
    } catch (e: any) {
        if (!e.data) errorMessage.value = "An unknown error occurred. Please try again.";

        const error = e as unknown as APIError;
        errorMessage.value = error.statusMessage;
    }
};

const submitReset = async () => {
    if (form.value.password !== form.value.confirmPassword) {
        errorMessage.value = "Passwords do not match.";
        toasterStore.addMessage("Passwords do not match.", "error");
        return;
    }

    try {
        await $fetch("/api/auth/reset/confirm", {
            method: "POST",
            body: {
                challengeId: challenge.value,
                token: resetToken.value,
                password: form.value.password,
            },
        });

        toasterStore.addMessage("Password reset", "info");

        router.push("/auth/signin");
    } catch (e: any) {
        if (!e.data) errorMessage.value = "An unknown error occurred. Please try again.";

        const error = e as unknown as APIError;
        errorMessage.value = error.statusMessage;
    }
};

// Check if challenge and reset-token exist in the URL query params
challenge.value = route.query.challenge as string;
resetToken.value = route.query["reset-token"] as string;
</script>