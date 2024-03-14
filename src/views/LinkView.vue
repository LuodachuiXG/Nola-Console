<script setup lang="ts">
import MyCard from '../components/component/MyCard.vue';
import { onMounted, ref } from 'vue';
import { Link } from '../models/Link.ts';
import { StoreEnum } from '../models/enum/StoreEnum.ts';

// 总链接数
const totalLinks = ref(0);
// 总页数
const totalPages = ref(0);
// 当前页数
const currentPage = ref(0);
// 每页条数
const pageSize = ref(10);
// 链接列表
const links = ref<Array<Link> | null>(null);

onMounted(() => {
  // 读取以前的设置
  loadSettings();
  // 刷新友情链接
  refreshLinks();
})

const loadSettings = () => {
  // 读取以前是否设置过每页大小
  pageSize.value = Number(localStorage.getItem(StoreEnum.LINK_PAGE_SIZE) ?? 10);
}

/**
 * 刷新友情链接
 */
const refreshLinks = () => {

}

/**
 * 分页组件当前页改变事件
 * @param page 当前页
 */
const onPageUpdate = (page: number) => {
  currentPage.value = page;
  // 刷新友情链链接
  refreshLinks();
};

/**
 * 分页组件每页大小改变事件
 * @param size 每页大小
 */
const onPageSizeUpdate = (size: number) => {
  pageSize.value = size;
  // 将每页大小存储
  localStorage.setItem(StoreEnum.LINK_PAGE_SIZE, size.toString());
  // 刷新友情链链接
  refreshLinks();
};
</script>

<template>
  <div class="container">
    <my-card
      :data-count="totalLinks"
      :show-empty-status="links !== null && links.length === 0"
      :current-page="currentPage"
      :page-size="pageSize"
      :page-count="totalPages"
      :current-page-item-count="links?.length ?? 0"
      item-string="友情链接"
      @on-page-update="onPageUpdate"
      @on-page-size-update="onPageSizeUpdate"
    >
    </my-card>
  </div>
</template>

<style scoped>

</style>