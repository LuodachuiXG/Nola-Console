<script setup lang="ts">
import MyCard from '../components/component/MyCard.vue';
import { inject, onMounted, ref } from 'vue';
import { Link } from '../models/Link.ts';
import { StoreEnum } from '../models/enum/StoreEnum.ts';
import { NButton, NIcon, NList } from 'naive-ui';
import { AddOutline as AddIcon } from '@vicons/ionicons5';
import LinkListItem from '../components/item/LinkListItem.vue';
import { getLinks } from '../apis/linkApi.ts';
import { LinkSort } from '../models/enum/LinkSort.ts';
import { errorMsg } from '../utils/Message.ts';
import { Pager } from '../models/Pager.ts';

const globalVars: GlobalVars = inject('globalVars')!!;

// 总链接数
const totalLinks = ref(0);
// 总页数
const totalPages = ref(0);
// 当前页数
const currentPage = ref(1);
// 每页条数
const pageSize = ref(10);
// 链接查询排序方式
const linkSort = ref<LinkSort>(LinkSort.PRIORITY_DESC);
// 链接列表
const links = ref<Array<Link> | null>(null);

onMounted(() => {
  // 读取以前的设置
  loadSettings();
  // 刷新友情链接
  refreshLinks();
});

const loadSettings = () => {
  // 读取以前是否设置过每页大小
  pageSize.value = Number(localStorage.getItem(StoreEnum.LINK_PAGE_SIZE) ?? 10);
};

/**
 * 刷新友情链接
 */
const refreshLinks = () => {
  window.$loadingBar.start();
  getLinks(currentPage.value, pageSize.value, linkSort.value)
    .then((res) => {
      window.$loadingBar.finish();
      let pager: Pager<Link> = res.data;
      currentPage.value = pager.page;
      pageSize.value = pager.size;
      totalLinks.value = pager.totalData;
      totalPages.value = pager.totalPages;
      links.value = pager.data;
    })
    .catch((err) => {
      window.$loadingBar.error();
      errorMsg(err);
    });
};

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

/**
 * 添加链接按钮点击事件
 */
const onAddLinkClick = () => {};

/**
 * 删除链接事件
 * @param link 链接
 */
const onDeleteLink = (link: Link) => {};

/**
 * 编辑链接事件
 * @param link 链接
 */
const onSettingLink = (link: Link) => {};
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
      show-pagination
      item-string="链接"
      @on-page-update="onPageUpdate"
      @on-page-size-update="onPageSizeUpdate"
    >
      <template #header-extra>
        <n-button type="primary" @click="onAddLinkClick">
          <template #icon>
            <n-icon>
              <AddIcon />
            </n-icon>
          </template>
          <span v-if="!globalVars.isSmallWindow">添加链接</span>
        </n-button>
      </template>
      <template #content>
        <!-- 链接列表 -->
        <div>
          <n-list hoverable>
            <link-list-item
              v-for="link in links"
              :link="link"
              @on-delete-link="onDeleteLink"
              @on-setting-link="onSettingLink"
            />
          </n-list>
        </div>
      </template>
    </my-card>
  </div>
</template>

<style scoped></style>
