<template>
	<nav class="bg-white shadow-md h-16">
		<div
			class="container mx-auto px-4 h-full flex items-center justify-between"
		>
			<div class="text-2xl font-bold text-black">nuxt-cookie-auth</div>
			<ClientOnly>
				<SessionState />
			</ClientOnly>
		</div>
	</nav>
</template>

<script lang="ts" setup></script>
