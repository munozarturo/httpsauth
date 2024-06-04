<template>
	<component :is="href ? 'a' : 'div'" :href="href" class="inline-block">
		<component class="svg" :is="type === 'long' ? LogoLong : LogoWide" />
	</component>
</template>

<script setup lang="ts">
import LogoLong from "~/assets/brand/httpsauth_logo_long.svg";
import LogoWide from "~/assets/brand/httpsauth_logo_wide.svg";

defineProps({
	type: {
		type: String,
		default: "long",
		validator: (value: string) => ["long", "wide"].includes(value),
	},
	href: {
		type: String,
		default: null,
	},
});
</script>

<style>
.svg {
	width: 100%;
	height: 100%;
	overflow: visible;
}
</style>
