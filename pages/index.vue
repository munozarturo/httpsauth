<template>
	<div
		class="h-full flex flex-col space-y-6 px-8 lg:px-32 py-4 lg:pt-16 text-xl"
	>
		<Logo type="long" />
		<div class="space-y-4">
			<div class="space-y-2">
				<p class="pl-4">Let&apos;s make this brief...</p>
				<ul class="pl-10 list-disc">
					<li>
						I am
						<a
							href="https://munozarturo.com/me"
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center px-2 py-1 rounded-lg text-sm font-bold bg-pink-100 text-pink-800 hover:bg-pink-200 transition-colors"
						>
							<span class="mr-1">@</span>
							Arturo
						</a>
					</li>
					<li>I like web development</li>
					<li>
						I have always wanted to implement authentication from
						scratch.
					</li>
				</ul>
				<p class="pl-4">
					This is my implementation of authentication from scratch.
				</p>
				<ul class="pl-10 space-y-2">
					<li>
						Built with
						<a
							href="https://nuxt.com"
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center px-2 py-1 rounded-lg text-sm font-bold bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
						>
							Nuxt </a
						>,
						<a
							href="https://www.postgresql.org/"
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center px-2 py-1 rounded-lg text-sm font-bold bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
						>
							PostgreSQL </a
						>, and
						<a
							href="https://aws.amazon.com/ses/"
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center px-2 py-1 rounded-lg text-sm font-bold bg-orange-100 text-orange-800 hover:bg-orange-200 transition-colors"
						>
							Amazon SES </a
						>.
					</li>
					<li>
						Hosted on
						<a
							href="https://vercel.com"
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center px-2 py-1 rounded-lg text-sm font-bold bg-black text-white hover:bg-gray-800 transition-colors"
						>
							Vercel
						</a>
						and
						<a
							href="https://github.com/munozarturo/httpsauth"
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center px-2 py-1 rounded-lg text-sm font-bold bg-black text-white hover:bg-gray-800 transition-colors"
						>
							GitHub </a
						>.
					</li>
				</ul>
				<p class="pl-4">
					I encourage you to try it out by
					<a class="underline" href="/auth/signup">signing up</a>.
				</p>
			</div>
			<div v-if="stats" class="w-full">
				<p class="pl-4">So far...</p>
				<ul class="list-disc pl-10">
					<li class="leading-relaxed">
						<span
							class="inline-flex items-center px-2 py-1 rounded-lg text-sm font-bold bg-sky-100 text-sky-800"
						>
							{{ stats.registeredUsers }}
						</span>
						users have signed up and
						<span
							class="inline-flex items-center px-2 py-1 rounded-lg text-sm font-bold bg-cyan-100 text-cyan-800"
						>
							{{ stats.verifiedUsers }}
						</span>
						accounts have been verified
					</li>
					<li class="leading-relaxed">
						<span
							class="inline-flex items-center px-2 py-1 rounded-lg text-sm font-bold bg-indigo-100 text-indigo-800"
						>
							{{ stats.activeSessions + stats.closedSessions }}
						</span>
						sessions have been created,
						<span
							class="inline-flex items-center px-2 py-1 rounded-lg text-sm font-bold bg-green-100 text-green-800"
						>
							{{ stats.activeSessions }}
						</span>
						{{ stats.activeSessions == 1 ? "is" : "are" }} open and
						<span
							class="inline-flex items-center px-2 py-1 rounded-lg text-sm font-bold bg-red-100 text-red-800"
						>
							{{ stats.closedSessions }}
						</span>
						{{ stats.closedSessions == 1 ? "is" : "are" }} closed
					</li>
					<li class="leading-relaxed">
						and
						<span
							class="inline-flex items-center px-2 py-1 rounded-lg text-sm font-bold bg-orange-100 text-orange-800"
						>
							{{ stats.passwordResets }}
						</span>
						password resets have occurred
					</li>
				</ul>
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
