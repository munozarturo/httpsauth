<template>
  <div>
    Home
    <p>Welcome {{ sessionToken }}</p>
  </div>
</template>

<script lang="ts" setup>
import type { AuthContext } from '~/server/middleware/auth';

const sessionToken = ref<string | null | undefined>(null);

sessionToken.value = useCookie("session-token").value;

onMounted(async () => {
  const res = await $fetch<AuthContext>("/api/auth/session");

  console.log(res);
})
</script>
