<template>
  <div>
    <ClientOnly>
      <p v-if="authStore.context">{{ authStore.context }}</p>
    </ClientOnly>
  </div>
</template>

<script lang="ts" setup>
const authStore = useAuthStore();
</script>
