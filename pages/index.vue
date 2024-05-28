<template>
  <div>
    Home
    <p>Welcome {{ sessionToken }}</p>
  </div>
</template>

<script lang="ts" setup>
const sessionToken = ref<string | null | undefined>(null);

sessionToken.value = useCookie("session-token").value;
</script>
