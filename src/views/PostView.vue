<script setup lang="ts">
import { NButton, NCard, NCol, NList, NRow, NScrollbar } from 'naive-ui';
import MyPagination from '../components/component/MyPagination.vue';
import MyNumberAnimation from '../components/component/MyNumberAnimation.vue';
import { onMounted, ref } from 'vue';
import MyEmptyResult from '../components/component/MyEmptyResult.vue';
import { StoreEnum } from '../models/enum/StoreEnum.ts';
import { Post } from '../models/Post.ts';

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
const onPaginationUpdate = (page: number) => {
  currentPage.value = page;
  // 刷新文章
  refreshPosts();
};

/**
 * 分页组件每页大小改变事件
 * @param size 每页大小
 */
const onPaginationSizeUpdate = (size: number) => {
  pageSize.value = size;
  // 将每页大小存储
  localStorage.setItem(StoreEnum.POST_PAGE_SIZE, size.toString());
  // 刷新文章
  refreshPosts();
};
</script>

<template>
  <div class="container">
    <n-card
      class="animate__animated animate__fadeIn"
      embedded
      :segmented="{
        content: true
      }"
      content-style="padding: 0;"
      size="small"
    >
      <template #header>
        共
        <MyNumberAnimation :to="totalPosts" />
        个文章，当前页
        <MyNumberAnimation :to="posts?.length ?? 0" />
        个
      </template>
      <template #header-extra>
        <n-button type="primary" @click="onAddPostClick">添加文章</n-button>
      </template>
      <template #default>
        <n-scrollbar style="max-height: calc(100vh - 194px)">
          <my-empty-result
            v-if="posts !== null && posts.length === 0"
            item-string="文章"
          />
          <!-- 文章列表 -->
          <n-list hoverable></n-list>
        </n-scrollbar>
      </template>
      <template #action>
        <n-row style="margin-bottom: -4px">
          <n-col :span="6">
            <div style="height: 28px; line-height: 28px">所有分类</div>
          </n-col>
          <n-col :span="18">
            <div class="pagination-div">
              <MyPagination
                :current-page="currentPage"
                :page-size="pageSize"
                :total-page="totalPages"
                @on-page-change="onPaginationUpdate"
                @on-page-size-change="onPaginationSizeUpdate"
              />
            </div>
          </n-col>
        </n-row>
      </template>
    </n-card>
  </div>
</template>

<style scoped></style>