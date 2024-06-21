<template>
	<div
		class="h-full flex flex-col space-y-6 px-8 lg:px-32 py-4 lg:pt-24 text-xl"
	>
		<Logo type="long" />
		<div class="space-y-4">
			<div class="space-y-2">
				<p class="pl-4">Let me make this brief...</p>
				<ul class="pl-10 list-disc">
					<li>My name is Arturo</li>
					<li>I like web development</li>
					<li>
						I have always wanted to implement authentication from
						scratch.
					</li>
				</ul>
				<p class="pl-4">
					This is my take on authentication from scratch.
				</p>
				<ul class="pl-10 list-disc">
					<li>Built with Nuxt, PostgreSQL and Amazon SES.</li>
					<li>Hosted on Vercel.</li>
				</ul>
				<p class="pl-4">
					Try it out by
					<a class="underline" href="/auth/signup">signing up</a>.
				</p>
			</div>
			<div
				v-if="stats"
				class="w-full md:w-4/5 grid grid-cols-1 md:grid-cols-5 gap-4 px-4 md:px-12"
			>
				<div
					v-for="(stat, key) in stats"
					:key="key"
					class="flex flex-row md:flex-col items-center md:items-stretch justify-between md:justify-center bg-black rounded-lg text-white p-4 space-x-4 md:space-x-0 md:space-y-2 h-24 md:h-32"
				>
					<div class="flex items-center justify-center md:flex-grow">
						<p class="text-3xl font-bold">{{ stat }}</p>
					</div>
					<div class="flex items-center justify-center md:h-12">
						<p class="text-center">{{ formatLabel(key) }}</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
const { data } = await useFetch("/api/auth/stats", { method: "GET" });

const stats = computed(() => {
	return data.value as {
		registeredUsers: number;
		verifiedUsers: number;
		activeSessions: number;
		closedSessions: number;
		passwordResets: number;
	};
});

function formatLabel(key: string): string {
	const labels: Record<string, string> = {
		registeredUsers: "Registered\nUsers",
		verifiedUsers: "Verified\nUsers",
		activeSessions: "Active\nSessions",
		closedSessions: "Closed\nSessions",
		passwordResets: "Passwords\nReset",
	};
	return labels[key] || key;
}
</script>
