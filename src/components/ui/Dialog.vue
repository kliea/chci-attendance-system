<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-10 flex items-center justify-center p-4 bg-anito-black/40 backdrop-blur-sm"
      @click.self="close"
    >
      <div
        class="bg-anito-white rounded-lg shadow-xl w-full max-h-[90vh] flex flex-col mx-auto"
        :class="contentClass"
      >
        <div v-if="$slots.header || $slots.actions" class="mb-6 flex items-center justify-between shrink-0 gap-4">
          <slot name="header" />
          <div class="flex items-center gap-2 ml-auto">
            <slot name="actions" />
            <button
              type="button"
              class="text-anito-gray hover:text-anito-black transition-colors duration-150"
              aria-label="Close"
              @click="close"
            >
              ✕
            </button>
          </div>
        </div>
        <div class="overflow-y-auto flex-1">
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  maxWidth: { type: String, default: 'max-w-lg' },
})

const emit = defineEmits(['update:modelValue'])

const contentClass = computed(() => [props.maxWidth, 'p-8'].filter(Boolean).join(' '))

function close() {
  emit('update:modelValue', false)
}
</script>
