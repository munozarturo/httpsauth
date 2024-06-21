<template>
	<div class="w-4/5 h-full flex flex-col space-y-6 px-32 pt-32 text-xl">
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
			</div>
			<div
				:v-if="stats"
				class="w-4/5 flex flex-row space-x-4 items-start justify-evenly px-12"
			>
				<div
					class="w-1/5 h-full flex flex-col items-center justify-center bg-black rounded-lg text-white p-4"
				>
					<div>
						<p>{{ stats.registeredUsers }}</p>
					</div>
					<div>
						<p class="font-bold text-center">
							Registered<br />Users
						</p>
					</div>
				</div>
				<div
					class="w-1/5 h-full flex flex-col items-center justify-center bg-black rounded-lg text-white p-4"
				>
					<div>
						<p>{{ stats.verifiedUsers }}</p>
					</div>
					<div>
						<p class="font-bold text-center">Verified<br />Users</p>
					</div>
				</div>
				<div
					class="w-1/5 h-full flex flex-col items-center justify-center bg-black rounded-lg text-white p-4"
				>
					<div>
						<p>{{ stats.activeSessions }}</p>
					</div>
					<div>
						<p class="font-bold text-center">
							Active<br />Sessions
						</p>
					</div>
				</div>
				<div
					class="w-1/5 h-full flex flex-col items-center justify-center bg-black rounded-lg text-white p-4"
				>
					<div>
						<p>{{ stats.closedSessions }}</p>
					</div>
					<div>
						<p class="font-bold text-center">
							Closed<br />Sessions
						</p>
					</div>
				</div>
				<div
					class="w-1/5 h-full flex flex-col items-center justify-center bg-black rounded-lg text-white p-4"
				>
					<div>
						<p>{{ stats.passwordResets }}</p>
					</div>
					<div>
						<p class="font-bold text-center">
							Passwords<br />Reset
						</p>
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
</script>
