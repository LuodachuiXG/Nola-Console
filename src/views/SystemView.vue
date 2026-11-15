<script setup lang="ts">
import { NTabs, NTabPane } from 'naive-ui';
import OperationPanel from '../components/component/OperationPanel.vue';
import AccessLogPanel from '../components/component/AccessLogPanel.vue';
import SystemHealthPanel from '../components/component/SystemHealthPanel.vue';
</script>

<template>
  <div class="container">
    <n-tabs type="line" animated display-directive="show:lazy">
      <n-tab-pane name="operation" tab="操作记录">
        <operation-panel />
      </n-tab-pane>
      <n-tab-pane name="access-log" tab="访问日志">
        <access-log-panel />
      </n-tab-pane>
      <n-tab-pane name="health" tab="服务状态">
        <system-health-panel />
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<style scoped></style>
