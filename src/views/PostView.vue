<script setup lang="ts">
import { NButton, NList } from 'naive-ui';
import { onMounted, ref } from 'vue';
import { StoreEnum } from '../models/enum/StoreEnum.ts';
import { Post } from '../models/Post.ts';
import MyCard from '../components/component/MyCard.vue';
import CategoryListItem from '../components/item/CategoryListItem.vue';

// 总文章数
const totalPosts = ref(0);
// 当前页
const currentPage = ref(0);
// 总页数
const totalPages = ref(0);
// 每页大小
const pageSize = ref(10);

const posts = ref<Array<Post> | null>(null);

onMounted(() => {});

/**
 * 刷新文章
 */
const refreshPosts = () => {};

/**
 * 添加文章按钮点击事件
 */
const onAddPostClick = () => {};

/**
 * 分页组件当前页改变事件
 * @param page 当前页
 */
const onPageUpdate = (page: number) => {
  currentPage.value = page;
  // 刷新文章
  refreshPosts();
};

/**
 * 分页组件每页大小改变事件
 * @param size 每页大小
 */
const onPageSizeUpdate = (size: number) => {
  pageSize.value = size;
  // 将每页大小存储
  localStorage.setItem(StoreEnum.POST_PAGE_SIZE, size.toString());
  // 刷新文章
  refreshPosts();
};
</script>

<template>
  <div class="container">
    <my-card
      :data-count="totalPosts"
      :show-empty-status="posts !== null && posts.length === 0"
      :current-page="currentPage"
      :page-size="pageSize"
      :page-count="totalPages"
      show-pagination
      item-string="分类"
      @on-page-update="onPageUpdate"
      @on-page-size-update="onPageSizeUpdate"
    >
      <template #header-extra>
        <n-button type="primary" @click="onAddPostClick">添加文章</n-button>
      </template>
      <template #content>
        <!-- 文章列表 -->
        <n-list hoverable>
          <category-list-item
            v-for="category in categories"
            :key="category.categoryId"
            :category="category"
            @on-delete-category="onDeleteCategory"
            @on-edit-category="onEditCategory"
          />
        </n-list>
      </template>
    </my-card>
  </div>
</template>

<style scoped></style>