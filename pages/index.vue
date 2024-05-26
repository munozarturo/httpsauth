<template>
  <div>
    Home
  </div>
</template>

<script lang="ts" setup>
import { useToasterStore } from '~/stores/toaster';

const toasterStore = useToasterStore();

onMounted(() => {
  // toasterStore.addMessage('Account verified successfully!', 'success');
  // toasterStore.addMessage('Uh Oh! There was an error.', 'error');
  // toasterStore.addMessage('You can now sign in with your new credentials.', 'info');

  // toasterStore.addMessage('Account verified successfully!', 'success');
  // setTimeout(() => {
  //   toasterStore.addMessage('Uh Oh! There was an error.', 'error');
  // }, 2000)
  // setTimeout(() => {
  //   toasterStore.addMessage('You can now sign in with your new credentials.', 'info');
  // }, 4000)
})
</script>
