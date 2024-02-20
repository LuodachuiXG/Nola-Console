<script setup lang="ts">
import { NDataTable } from 'naive-ui';
import { onMounted, ref } from 'vue';
import { tagsByPage } from '../apis/tagApi.ts';

// 当前页数
const currentPage = ref(1);
// 每页条数
const pageSize = ref(10)

onMounted(() => {
  // 刷新标签数据
  refreshTags();
});

/**
 * 刷新标签数据
 */
const refreshTags = () => {
  tagsByPage(currentPage.value, pageSize.value).then((res) => {
    console.log(res.data);
  }).catch((err) => {
    window.$message.error(err);
  });
}

</script>

<template>
  <div class="container">
    <n-data-table
      :columns="columns"
      :data="data"
      :pagination="pagination"
      :bordered="false"
    />
  </div>
</template>

<style scoped></style>
