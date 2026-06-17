<template>
  <div class="flex h-screen bg-anito-white overflow-hidden">
    
    <Sidebar />
    
    <main class="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
      <TopBar />
      <div class="flex-1 px-8 py-10">
        <router-view />
      </div>
    </main>

  </div>
</template>

<script setup>
import Sidebar from './Sidebar.vue'
import TopBar from './TopBar.vue'
</script>