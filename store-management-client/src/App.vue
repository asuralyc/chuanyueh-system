<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from './store/auth';

// When the app is first mounted, try to fetch the user profile
// if a token exists in local storage. This handles persistent login.
onMounted(() => {
  const authStore = useAuthStore();
  if (authStore.token) {
    authStore.fetchUser();
  }
});
</script>
