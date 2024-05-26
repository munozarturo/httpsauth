<template>
    <div class="flex items-center justify-center min-h-screen bg-gray-100">
        <div class="bg-white p-8 rounded-lg shadow-md">
            <h2 class="text-2xl font-bold mb-6 text-center">Sign In</h2>
            <form @submit.prevent="submitForm" class="space-y-4">
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
                <button type="submit"
                    class="w-full bg-black text-white font-bold py-2 px-4 rounded-md hover:bg-gray-800">Sign In</button>
                <div class="text-center mt-4">
                    <a href="/auth/reset" class="text-sm text-gray-600 hover:text-gray-800">Forgot Password?</a>
                </div>
            </form>
            <div class="mt-6 flex items-center">
                <div class="border-t border-gray-300 flex-grow mr-3"></div>
                <div class="text-gray-600">or</div>
                <div class="border-t border-gray-300 flex-grow ml-3"></div>
            </div>
            <div class="mt-6 text-center">
                <a href="/auth/signup" class="text-black font-bold hover:underline">Sign Up</a>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const form = ref({
    email: '',
    password: ''
});

const submitForm = async () => {
    try {
        const res = await $fetch('/api/auth/signin', {
            method: 'POST',
            body: form.value
        });

        router.push("/");
    } catch (error) {
        console.error(error);
        // Handle registration error, e.g., show error message to the user
    }
};
</script>