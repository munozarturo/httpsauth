<template>
	<nav class="bg-white shadow-md h-16">
		<div
			class="container mx-auto px-4 h-full flex items-center justify-between"
		>
			<a href="/" class="text-2xl font-bold text-black"
				>nuxt-cookie-auth</a
			>
			<ClientOnly>
				<SessionState />
			</ClientOnly>
		</div>
	</nav>
</template>

<script lang="ts" setup></script>
