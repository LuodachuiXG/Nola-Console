<script setup lang="ts">
import { NButton, NList } from 'naive-ui';
import { onMounted, ref } from 'vue';
import { StoreEnum } from '../models/enum/StoreEnum.ts';
import { Post } from '../models/Post.ts';
import MyCard from '../components/component/MyCard.vue';
import PostListItem from '../components/item/PostListItem.vue';
import {
  posts as getPosts
} from '../apis/postApi.ts';
import { PostStatus } from '../models/enum/PostStatus.ts';
import { PostVisible } from '../models/enum/PostVisible.ts';
import { PostSort } from '../models/enum/PostSort.ts';
import { errorMsg } from '../utils/Message.ts';
import { Pager } from '../models/Pager.ts';

// 总文章数
const totalPosts = ref(0);
// 当前页
const currentPage = ref(1);
// 总页数
const totalPages = ref(0);
// 每页大小
const pageSize = ref(10);
// 文章列表
const posts = ref<Array<Post> | null>(null);

// 检索文章状态
const queryPostStatus = ref<PostStatus | null>(null);
// 检索文章可见性
const queryPostVisible = ref<PostVisible | null>(null);
// 检索文章关键词
const queryKey = ref<string | null>(null);
// 检索标签 ID
const queryTagId = ref<number | null>(null);
// 检索分类 ID
const queryCategoryId = ref<number | null>(null);
// 检索文章排序
const querySort = ref<PostSort | null>(null);

onMounted(() => {
  // 读取以前是否设置过每页大小
  pageSize.value = Number(
    localStorage.getItem(StoreEnum.POST_PAGE_SIZE) ?? 10
  );

  // 刷新文章数据
  refreshPosts()
});

/**
 * 刷新文章
 */
const refreshPosts = () => {
  window.$loadingBar.start();
  // 获取文章
  getPosts(
    currentPage.value, pageSize.value, queryPostStatus.value, queryPostVisible.value,
    queryKey.value, queryTagId.value, queryCategoryId.value, querySort.value
  ).then((res) => {
    let pager = res.data as Pager<Post>;
    if (pager.data?.length === 0 && pager.totalData !== 0) {
      // 当前页数量为空，并且总分类数不为空
      // 将当前页改为第一页，然后重新获取分类
      currentPage.value = 1;
      refreshPosts();
      return;
    }
    posts.value = pager.data;
    totalPosts.value = pager.totalData;
    totalPages.value = pager.totalPages;
    window.$loadingBar.finish();
  }).catch((err) => {
    errorMsg(err);
    window.$loadingBar.error();
  });
};

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

/**
 * 编辑文章按钮点击事件
 * @param post 文章接口
 */
const onEditPost = (post: Post) => {

};

/**
 * 设置文章按钮点击事件
 * @param post 文章接口
 */
const onSettingPost = (post: Post) => {

};

/**
 * 删除文章按钮点击事件
 * @param post 文章接口
 */
const onDeletePost = (post: Post) => {

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
      :current-page-item-count="posts?.length ?? 0"
      show-pagination
      item-string="文章"
      @on-page-update="onPageUpdate"
      @on-page-size-update="onPageSizeUpdate"
    >
      <template #header-extra>
        <n-button type="primary" @click="onAddPostClick">添加文章</n-button>
      </template>
      <template #content>
        <!-- 文章列表 -->
        <n-list hoverable>
          <post-list-item
            v-for="post in posts"
            :key="post.postId"
            :post="post"
            @on-edit-post="onEditPost"
            @on-setting-post="onSettingPost"
            @on-delete-post="onDeletePost"
          />
        </n-list>
      </template>
    </my-card>
  </div>
</template>

<style scoped></style>