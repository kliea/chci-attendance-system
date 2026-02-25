<template>
  <div class="overflow-x-auto">
    <table class="w-full text-sm text-left">
      <thead class="bg-anito-black">
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            :class="col.class"
            class="text-[9px] tracking-[0.25em] uppercase text-anito-gray-light font-sans font-medium px-4 py-3 text-left"
          >
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody>
          <tr
            v-for="(row, idx) in data"
            :key="rowKey ? row[rowKey] : idx"
            class="bg-white hover:bg-anito-blue-light border-b border-anito-gray-light transition-colors duration-150"
            :class="rowClass?.(row)"
            @click="rowClick?.(row)"
          >
            <slot name="row" :row="row" :columns="columns">
              <td
                v-for="col in columns"
                :key="col.key"
                :class="col.cellClass"
                class="px-4 py-3 text-sm font-sans text-anito-black"
              >
                {{ row[col.key] ?? '—' }}
              </td>
            </slot>
          </tr>
          <tr v-if="empty && !data.length">
            <td :colspan="columns.length" class="px-4 py-8 text-center text-anito-gray text-sm font-sans font-light">
              <slot name="empty">
                {{ emptyText }}
              </slot>
            </td>
          </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({
  columns: { type: Array, required: true },
  data: { type: Array, default: () => [] },
  rowKey: String,
  rowClass: Function,
  rowClick: Function,
  empty: { type: Boolean, default: true },
  emptyText: { type: String, default: 'No records.' },
})
</script>
