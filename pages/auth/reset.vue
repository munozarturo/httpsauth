<template>
    <div class="flex items-center justify-center min-h-screen bg-gray-100">
        <div class="bg-white p-8 rounded-lg shadow-md">
            <h2 class="text-2xl font-bold mb-6 text-center">Reset Password</h2>
            <div v-if="!challengeId">
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
            <div v-else>
                <form @submit.prevent="submitReset" class="space-y-2">
                    <div>
                        <label for="code" class="block text-gray-700 font-bold mb-2">6-Digit Code</label>
                        <input type="text" id="code" v-model="form.code" required maxlength="6"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent" />
                    </div>
                    <div>
                        <label for="password" class="block text-gray-700 font-bold mb-2">New Password</label>
                        <input type="password" id="password" v-model="form.password" required
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent" />
                    </div>
                    <button type="submit"
                        class="w-full bg-black text-white font-bold py-2 px-4 rounded-md hover:bg-gray-800">
                        Reset Password
                    </button>
                </form>
            </div>
            <div v-if="errorMessage" class="mt-4 text-center text-red-500">{{ errorMessage }}</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

interface FormData {
    email: string;
    code: string;
    password: string;
}

const route = useRoute();
const router = useRouter();
const form = ref<FormData>({
    email: '',
    code: '',
    password: '',
});
const challengeId = ref('');
const errorMessage = ref('');

const submitEmail = async () => {
    try {
        const res = await $fetch<{ message: string, challengeId: string }>('/api/auth/reset', {
            method: 'POST',
            body: { email: form.value.email },
        });
        challengeId.value = res.challengeId;
        router.replace({ query: { challengeId: challengeId.value } });
    } catch (error: any) {
        console.error(error);
        errorMessage.value = 'An error occurred. Please try again.';
    }
};

const submitReset = async () => {
    try {
        const res = await $fetch('/api/auth/reset/confirm', {
            method: 'POST',
            body: {
                challengeId: challengeId.value,
                token: form.value.code,
                password: form.value.password,
            },
        });
        router.push('/auth/signin');
    } catch (error: any) {
        console.error(error);
        errorMessage.value = 'Invalid verification code or password. Please try again.';
    }
};

// Check if challengeId exists in the URL query params
challengeId.value = route.query.challengeId as string;
</script>