<!-- 自定义分页组件 -->
<script setup lang="ts">
import { NButton, NPagination, NPopselect } from 'naive-ui';

// 分页大小
const pageSizes = [
  {
    label: '10 / 页',
    value: 10
  },
  {
    label: '20 / 页',
    value: 20
  },
  {
    label: '30 / 页',
    value: 30
  },
  {
    label: '60 / 页',
    value: 60
  },
  {
    label: '90 / 页',
    value: 90
  },
  {
    label: '120 / 页',
    value: 120
  }
];

/**
 * 当前组件自定义参数
 */
interface Props {
  /** 当前页 **/
  currentPage: number;
  /** 每页大小 **/
  pageSize: number;
  /** 总页数 **/
  totalPage: number;
}

defineProps<Props>();

const emit = defineEmits<{
  /** 页数改变事件 **/
  (e: 'onPageChange', page: number): void
  /** 每页大小改变事件 **/
  (e: 'onPageSizeChange', size: number): void
}>();

/**
 * 当前页改变事件
 * @param page 当前页数
 */
const onPaginationUpdate = (page: number) => {
  emit('onPageChange', page);
};

/**
 * 每页大小改变事件
 * @param size 页大小
 */
const onPaginationSizeUpdate = (size: number) => {
  emit('onPageSizeChange', size);
};
</script>

<template>
  <n-pagination
    :page="currentPage"
    :page-count="totalPage"
    @update:page="onPaginationUpdate"
    style="margin-right: 10px"
  />
  <!-- 上面的分页组件自带的每页大小选项器有问题，所以用下面的弹出选择替代 -->
  <n-popselect
    :value="pageSize"
    :options="pageSizes"
    trigger="click"
    size="small"
    @update:value="onPaginationSizeUpdate"
  >
    <n-button size="small">{{ pageSize + ' / 页' }}</n-button>
  </n-popselect>
</template>

<style scoped></style>
