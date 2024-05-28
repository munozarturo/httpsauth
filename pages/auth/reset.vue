<template>
	<div>
		<ResetPassword :challenge="challenge" :token="token" />
	</div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import ResetPassword from "~/components/auth/reset-password.vue";

const route = useRoute();
const challenge = route.query.challenge as string;
const token = route.query.token as string;

definePageMeta({
	layout: "auth",
});
</script>
