<!-- 自定义空状态组件 -->
<script setup lang="ts">
import { NResult } from 'naive-ui';

interface Props {
  /** 空状态描述的项目（如：文章、分类、标签等） */
  itemString: string;
}

defineProps<Props>();
</script>

<template>
  <n-result
    style="margin: 40px 0"
    status="500"
    title="这里什么都没有"
  />
</template>

<style scoped></style>
