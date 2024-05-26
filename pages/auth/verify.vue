<template>
    <div class="flex items-center justify-center min-h-screen bg-gray-100">
        <div class="bg-white p-8 rounded-lg shadow-md">
            <h2 class="text-2xl font-bold mb-6 text-center">Verify</h2>
            <div v-if="!challenge">
                <p v-if="errorMessage" class="mt-4 text-center">{{ errorMessage }}</p>
                <p v-else class="text-center text-gray-600">Sending Verification Code...</p>
            </div>
            <div v-else>
                <p class="text-center text-gray-700 mb-4">Enter the 6-digit verification code sent to your email.</p>
                <VerificationCodeInput @submit="submitVerificationCode" />
                <p v-if="errorMessage" class="mt-4 text-center">{{ errorMessage }}</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { APIError } from '~/utils/errors/api';
import { useToasterStore } from '~/stores/toaster';

const toasterStore = useToasterStore();

const route = useRoute();
const router = useRouter();
const email = ref('');
const challenge = ref('');
const errorMessage = ref('');

onMounted(async () => {
    email.value = route.query.email as string;
    if (email.value) {
        try {
            const res = await $fetch<{ challengeId: string }>('/api/auth/verify', {
                method: 'POST',
                body: { email: email.value },
            });

            challenge.value = res.challengeId;
            router.replace({ query: { challenge: challenge.value } });

            toasterStore.addMessage("We sent a verification code to your email address", "info");
        } catch (e: any) {
            if (!e.data) errorMessage.value = "An unknown error occurred. Please try again.";

            const error = e as unknown as APIError;
            errorMessage.value = error.statusMessage;

            toasterStore.addMessage(error.statusMessage, "error");
        }
    } else {
        challenge.value = route.query.challenge as string;
    }
});

const submitVerificationCode = async (code: string) => {
    try {
        await $fetch('/api/auth/verify/confirm', {
            method: 'POST',
            body: {
                challengeId: challenge.value,
                token: code,
            },
        });

        toasterStore.addMessage("Account verified", "success");

        router.push('/auth/signin');
    } catch (e: any) {
        if (!e.data) errorMessage.value = "An unknown error occurred. Please try again.";

        const error = e as unknown as APIError;
        errorMessage.value = error.statusMessage;

        toasterStore.addMessage(error.statusMessage, "error");
    }
};
</script>