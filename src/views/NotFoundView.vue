<script setup lang="ts">
import {
  NResult,
  NButton
} from 'naive-ui';
import router from '../router';
import { RouterViews } from '../router/RouterViews.ts';
</script>

<template>
  <div class="container">
    <n-result status="404" title="404 资源不存在" description="此路不通">
      <template #footer>
        <n-button @click="router.push(RouterViews.MAIN)">返回主页</n-button>
      </template>
    </n-result>
  </div>
</template>

<style scoped lang="scss">
.container {
  text-align: center;
}

.container span {
  font-size: 3em;
}
</style>
