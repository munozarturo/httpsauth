<template>
	<main class="w-screen h-screen flex justify-center items-center">
		<div class="w-1/2 h-2/3 flex flex-row shadow-lg rounded-lg bg-white">
			<div
				class="w-6/12 h-full flex flex-col items-center justify-center rounded-lg overflow-hidden"
			>
				<img
					src="~/assets/images/padlock.jpeg"
					alt="Padlock"
					class="w-full h-full object-cover"
				/>
			</div>
			<div
				class="w-6/12 h-full flex flex-col items-center justify-around space-y-12 py-12 px-16"
			>
				<h1 href="/" class="text-3xl font-bold text-black">
					nuxt-cookie-auth
				</h1>
				<SignInForm />
			</div>
		</div>
	</main>
</template>

<script>
definePageMeta({
	layout: "auth",
});
</script>
