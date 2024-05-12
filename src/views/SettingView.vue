<script setup lang="ts">
import { NTabs, NTabPane, NCard } from 'naive-ui';
import BlogSettingComponent from '../components/setting/BlogSettingComponent.vue';
</script>

<template>
  <div class="container">
    <n-card
      style="margin-bottom: 16px"
      class="animate__animated animate__fadeIn"
    >
      <n-tabs type="line" animated>
        <n-tab-pane name="blogSetting" tab="博客设置">
          <blog-setting-component />
        </n-tab-pane>
        <n-tab-pane name="icpSetting" tab="备案设置">
          ICP
        </n-tab-pane>
      </n-tabs>
    </n-card>
  </div>
</template>

<style scoped></style>
