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
                <p v-if="errorMessage" class="mt-4 text-center">{{ errorMessage }}</p>
                <p v-else-if="retryTimer > 0" class="mt-4 text-center text-gray-600">
                    There has been an error, trying again in {{ retryTimer }} seconds.
                </p>
            </div>
            <div v-else-if="!resetToken">
                <p class="text-center text-gray-700 mb-4">Enter the verification code sent to your email.</p>
                <VerificationCodeInput @submit="submitVerificationCode" />
                <p v-if="errorMessage" class="mt-4 text-center">{{ errorMessage }}</p>
                <div class="text-center mt-4">
                    <button v-if="timer > 0" class="text-sm text-gray-600" disabled>
                        Resend code in {{ timer }} seconds
                    </button>
                    <button v-else class="text-sm text-gray-600 hover:text-gray-800" @click="resendVerificationCode">
                        Resend code?
                    </button>
                </div>
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
                <p v-if="errorMessage" class="mt-4 text-center">{{ errorMessage }}</p>
            </div>
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
const timer = ref(0);
const timerInterval = ref<NodeJS.Timeout | null>(null);
const retryTimer = ref(0);
const retryTimerInterval = ref<NodeJS.Timeout | null>(null);

const submitEmail = async () => {
    try {
        const res = await $fetch<{ challengeId: string }>("/api/auth/reset", {
            method: "POST",
            body: { email: form.value.email },
        });
        challenge.value = res.challengeId;
        router.replace({ query: { challenge: challenge.value } });

        errorMessage.value = "";

        toasterStore.addMessage("We sent a verification code to your email address", "info");
        startTimer();
    } catch (e: any) {
        if (!e.data) errorMessage.value = "An unknown error occurred. Please try again.";

        const error = e as unknown as APIError;
        if (error.statusCode === 429) {
            startRetryTimer();
        } else if (error.statusCode === 404) {
            toasterStore.addMessage("Email not found", "error");

            router.push('/auth/signin');
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
    await submitEmail();
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

        errorMessage.value = "";

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

        toasterStore.addMessage("Password reset", "success");

        errorMessage.value = "";

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