<script setup lang="ts">
import { NButton, NListItem, NText, NThing } from 'naive-ui';
import { MenuItem } from '../../models/MenuItem.ts';

interface Props {
  menuItem: MenuItem;
  menuItemLevel: Map<number, number>;
}

const props = defineProps<Props>();
</script>

<template>
  <n-list-item
    class="menu-move"
    :style="{
      marginLeft:
        ((menuItemLevel.get(menuItem.menuItemId) ?? 0) - 1) * 30 + 'px'
    }"
  >
    <n-thing class="animate__animated animate__fadeIn">
      <template #header>
        <n-text class="menu-title">{{ menuItem.displayName }}</n-text>
      </template>
      <template #description>
        <n-button
          text
          tag="a"
          :href="menuItem.href"
          target="_blank"
          type="primary"
        >
          {{ menuItem.href }}
        </n-button>
      </template>
      <template #header-extra></template>
    </n-thing>
  </n-list-item>
  <menu-item-list-item
    v-if="menuItem.children.length > 0"
    v-for="child in menuItem.children"
    :key="menuItem.menuItemId"
    :menu-item="child"
    :menu-item-level="menuItemLevel"
  />
</template>

<style scoped></style>
