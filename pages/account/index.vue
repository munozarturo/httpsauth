<template>
	<div
		class="h-full flex flex-col space-y-8 px-8 lg:px-32 py-4 lg:pt-16 text-xl"
	>
		<Logo type="long" />
		<div v-if="auth.context" class="space-y-8">
			<h1 class="text-4xl font-bold">Welcome to Your Account</h1>
			<div class="space-y-4">
				<p class="pl-4">
					Here's a quick overview of your account information:
				</p>
				<ul class="pl-10 list-disc">
					<li>
						Your account belongs to
						<span
							class="inline-flex items-center px-2 py-1 rounded-lg text-sm font-bold bg-blue-100 text-blue-800"
						>
							{{ auth.context.user.email }}
						</span>
						and it is
						<span
							:class="[
								'inline-flex items-center px-2 py-1 rounded-lg text-sm font-bold',
								auth.context.user.verified
									? 'bg-green-100 text-green-800'
									: 'bg-red-100 text-red-800',
							]"
						>
							{{
								auth.context.user.verified
									? "verified"
									: "not verified"
							}}
						</span>
					</li>
					<li>
						Your current session was opened
						<span
							class="inline-flex items-center px-2 py-1 rounded-lg text-sm font-bold bg-orange-100 text-orange-800"
						>
							{{
								formatDate(
									auth.context.session.createdAt.toString()
								)
							}}
						</span>
						, it is
						<span
							:class="[
								'inline-flex items-center px-2 py-1 rounded-lg text-sm font-bold',
								auth.context.session.active
									? 'bg-green-100 text-green-800'
									: 'bg-red-100 text-red-800',
							]"
						>
							{{
								auth.context.session.active
									? "active"
									: "inactive"
							}}
						</span>
						and the token is
						<span
							class="inline-flex items-center px-2 py-1 rounded-lg text-sm font-bold bg-purple-100 text-purple-800"
						>
							{{ auth.context.session.token }}
						</span>
					</li>
				</ul>
				<p class="pl-4">
					Need to make changes? You can
					<a class="underline" href="/auth/change-password"
						>change your password</a
					>
					or
					<a class="underline" href="/auth/logout">log out</a>.
				</p>
			</div>
		</div>
		<div v-else class="text-2xl font-bold">Loading...</div>
	</div>
</template>

<script lang="ts" setup>
definePageMeta({
	middleware: "protected",
});

import { useAuthStore } from "~/stores/auth";

const auth = useAuthStore();

const formatDate = (dateString: string) => {
	const options: Intl.DateTimeFormatOptions = {
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "numeric",
		minute: "numeric",
	};
	return new Date(dateString).toLocaleDateString(undefined, options);
};
</script>
