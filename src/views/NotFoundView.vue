<template>
  <div class="min-h-screen bg-anito-black flex flex-col items-center justify-center p-8">
    <span class="font-display font-light text-2xl tracking-[0.22em] uppercase text-white">
      ANITO<span class="inline-block w-1.5 h-1.5 rounded-full bg-anito-blue-mid mb-0.5 ml-0.5 align-middle"></span>
    </span>
    <p class="font-display font-light text-4xl tracking-wide text-anito-white mt-6">404</p>
    <p class="text-anito-gray font-sans font-light mt-2">Page not found</p>
    <router-link
      :to="{ name: 'dashboard' }"
      class="mt-6 text-anito-blue-mid hover:underline font-sans text-sm"
    >
      Back to dashboard
    </router-link>
  </div>
</template>

<script setup>
</script>
