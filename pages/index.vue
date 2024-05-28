<template>
  <div>
    <ClientOnly>
      <p v-if="authStore.isAuthenticated">{{ authStore.context }}</p>
    </ClientOnly>
  </div>
</template>

<script lang="ts" setup>
const authStore = useAuthStore();
</script>
