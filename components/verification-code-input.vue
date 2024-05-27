<template>
    <form @submit.prevent="submitVerificationCode" class="space-y-4">
        <div class="flex justify-center space-x-4">
            <input v-for="(digit, index) in verificationCodeDigits" :key="index" type="text"
                v-model="verificationCodeDigits[index]" maxlength="1" required
                class="w-12 h-12 text-center text-2xl border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                @input="handleDigitInput(index)" @keydown.delete="handleDeleteKey(index)" @paste="handlePaste" />
        </div>
        <button type="submit" class="w-full bg-black text-white font-bold py-2 px-4 rounded-md hover:bg-gray-800">
            Verify
        </button>
    </form>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue';

const emit = defineEmits(['submit']);
const verificationCodeDigits = ref(Array(6).fill(''));

const handleDigitInput = (index: number) => {
    const digit = verificationCodeDigits.value[index];
    if (digit.length === 1 && index < 5) {
        (document.querySelector(`input[type='text']:nth-child(${index + 2})`) as HTMLInputElement)?.focus();
    }
};

const handleDeleteKey = (index: number) => {
    if (verificationCodeDigits.value[index].length === 0 && index > 0) {
        (document.querySelector(`input[type='text']:nth-child(${index})`) as HTMLInputElement)?.focus();
    }
};

const handlePaste = (event: ClipboardEvent) => {
    const pasteData = event.clipboardData?.getData('text');
    if (pasteData) {
        event.preventDefault();
        verificationCodeDigits.value = pasteData.substring(0, 6).split('');
    }
};

const submitVerificationCode = () => {
    const code = verificationCodeDigits.value.join('');
    emit('submit', code);
};

watch(
    verificationCodeDigits,
    (newValue) => {
        const isAllDigitsFilled = newValue.every((digit) => digit !== '');
        if (isAllDigitsFilled) {
            submitVerificationCode();
        }
    },
    { deep: true }
);
</script>