<template>
	<main class="w-screen h-screen flex justify-center items-center">
		<div class="w-1/2 h-2/3 flex flex-row shadow-lg rounded-lg bg-white">
			<div
				class="w-1/2 h-full flex flex-col items-center justify-center rounded-lg overflow-hidden"
			>
				<img
					src="~/assets/images/padlock.jpeg"
					alt="Padlock"
					class="w-full h-full object-cover"
				/>
			</div>
			<div
				class="w-1/2 h-full flex flex-col items-center justify-start overflow-auto"
			>
				<div
					class="w-full h-full flex flex-col space-y-6 items-center justify-start p-12"
				>
					<h1
						href="/"
						class="w-full text-left text-2xl font-bold text-black"
					>
						Sign Up
					</h1>
					<SignUpForm class="w-full h-full" />
				</div>
			</div>
		</div>
	</main>
</template>

<script>
definePageMeta({
	layout: "auth",
});
</script>
