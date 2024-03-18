<script setup lang="ts">
import MyCard from '../components/component/MyCard.vue';
import { NTree } from 'naive-ui';
</script>

<template>
  <div class="container">
    <my-card item-string="菜单">
      <template #header></template>
    </my-card>
  </div>
</template>

<style scoped></style>
