<template>
  <div class="flex min-h-screen bg-surface">
    <Sidebar />
    <main class="flex-1 flex flex-col min-w-0">
      <TopBar />
      <div class="flex-1 p-6">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import Sidebar from './Sidebar.vue'
import TopBar from './TopBar.vue'
</script>
