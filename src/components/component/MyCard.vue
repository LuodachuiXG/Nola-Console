<script setup lang="ts">
import MyNumberAnimation from './MyNumberAnimation.vue';
import MyEmptyResult from './MyEmptyResult.vue';
import {
  NCard,
  NCol,
  NRow,
  NScrollbar,
  NText
} from 'naive-ui';
import MyPagination from './MyPagination.vue';

interface Props {
  /** 使用更深的背景色展现嵌入效果，只对亮色主题生效（默认 true） **/
  embedded?: boolean;
  /** 卡片尺寸（默认 small） **/
  size?: 'small' | 'medium' | 'large' | 'huge';
  /** 总项目数量 **/
  dataCount?: number;
  /** 卡片的项目名（如：文章、分类、标签等） */
  itemString?: string;
  /** 是否显示空状态提示（默认 false） **/
  showEmptyStatus?: boolean;
  /** 是否显示分页组件（默认 true） **/
  showPagination?: boolean;
  /** 总页数（默认 1） **/
  pageCount?: number;
  /** 当前页（默认 1） **/
  currentPage?: number;
  /** 当前页项目数量 （默认 0） **/
  currentPageItemCount?: number;
  /** 每页条数（默认 10） **/
  pageSize?: number;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'onPageUpdate', page: number): void;
  (e: 'onPageSizeUpdate', size: number): void;
}>();

/**
 * 分页组件当前页改变事件
 * @param page 当前页
 */
const onPaginationUpdate = (page: number) => {
  emit('onPageUpdate', page);
};

/**
 * 分页组件每页大小改变事件
 * @param size 每页大小
 */
const onPaginationSizeUpdate = (size: number) => {
  emit('onPageSizeUpdate', size);
};
</script>

<template>
  <n-card
    class="animate__animated animate__fadeIn"
    :embedded="embedded ?? true"
    :segmented="{
          content: true
        }"
    content-style="padding: 0;"
    :size="size ?? 'small'"
  >
    <template #header>
      <slot name="header">
            <span>
              共
              <MyNumberAnimation :to="dataCount ?? 0" />
              个{{ itemString ?? '项目' }}
            </span>
        <span v-if="showPagination ?? true">
              ，当前页
              <MyNumberAnimation :to="currentPageItemCount ?? 0" />
              个
            </span>
      </slot>
    </template>
    <template #header-extra>
      <slot name="header-extra" />
    </template>
    <template #default>
      <n-scrollbar style="max-height: calc(100vh - 196px)">
        <my-empty-result
          v-if="showEmptyStatus ?? false"
          :item-string="itemString ?? '项目'"
        />
        <slot v-else name="content" />
      </n-scrollbar>
    </template>
    <template #action>
      <n-row style="margin-bottom: -4px">
        <n-col :span="6">
          <slot name="action-left">
            <n-text style="margin-top: 1px" tag="div">
              {{ '所有' + itemString }}
            </n-text>
          </slot>
        </n-col>
        <n-col :span="18">
          <div class="pagination-div" v-if="showPagination ?? true">
            <MyPagination
              :current-page="currentPage ?? 1"
              :page-size="pageSize ?? 10"
              :total-page="pageCount ?? 1"
              @on-page-change="onPaginationUpdate"
              @on-page-size-change="onPaginationSizeUpdate"
            />
          </div>
        </n-col>
      </n-row>
    </template>
  </n-card>
</template>

<style scoped></style>
