<template>
    <div class="flex items-center justify-center min-h-screen bg-gray-100">
        <div class="bg-white p-8 rounded-lg shadow-md">
            <h2 class="text-2xl font-bold mb-6 text-center">Verify</h2>
            <div v-if="!challengeId">
                <p class="text-center text-gray-600">Sending Verification Code...</p>
            </div>
            <div v-else>
                <p class="text-center text-gray-700 mb-4">Enter the 6-digit verification code sent to your email:</p>
                <form @submit.prevent="submitVerificationCode" class="space-y-4">
                    <div>
                        <input type="text" v-model="verificationCode" maxlength="6" required
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent" />
                    </div>
                    <button type="submit"
                        class="w-full bg-black text-white font-bold py-2 px-4 rounded-md hover:bg-gray-800">
                        Verify
                    </button>
                </form>
                <p v-if="errorMessage" class="mt-4 text-center text-red-500">{{ errorMessage }}</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const email = ref('');
const challengeId = ref('');
const verificationCode = ref('');
const errorMessage = ref('');

onMounted(async () => {
    email.value = route.query.email as string;
    if (email.value) {
        try {
            const res = await $fetch<{ statusCode: Number, message: string, challengeId: string }>('/api/auth/verify', {
                method: 'POST',
                body: { email: email.value },
            });

            challengeId.value = res.challengeId;
            router.replace({ query: { challengeId: challengeId.value } });
        } catch (error) {
            console.error(error);
            errorMessage.value = 'An error occurred during verification.';
        }
    } else {
        challengeId.value = route.query.challengeId as string;
    }
});

const submitVerificationCode = async () => {
    try {
        const res = await $fetch('/api/auth/verify/confirm', {
            method: 'POST',
            body: {
                challengeId: challengeId.value,
                token: verificationCode.value,
            },
        });
        router.push('/auth/signin');
    } catch (error) {
        console.error(error);

        errorMessage.value = 'Invalid verification code. Please try again.';
    }
};
</script>