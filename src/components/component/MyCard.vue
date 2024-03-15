<script setup lang="ts">
import MyNumberAnimation from './MyNumberAnimation.vue';
import MyEmptyResult from './MyEmptyResult.vue';
import {
  NCard,
  NCol,
  NRow,
  NScrollbar,
  NText,
  NCheckbox,
  NSpace,
  NButton,
  NIcon
} from 'naive-ui';
import MyPagination from './MyPagination.vue';
import { inject } from 'vue';
import { TrashOutline as TrashIcon } from '@vicons/ionicons5';

const globalVars: GlobalVars = inject('globalVars')!!;

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
  /** 是否显示选择框（默认 false） **/
  showCheckbox?: boolean;
  /** 选择框是否选中（默认 false） **/
  isChecked?: boolean;
  /** 是否显示删除按钮（默认 false） **/
  showDeleteButton?: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  // 当前页数改变事件
  (e: 'onPageUpdate', page: number): void;
  // 每页大小改变事件
  (e: 'onPageSizeUpdate', size: number): void;
  // 选择框选择事件
  (e: 'onChecked'): void;
  // 选择框取消选择事件
  (e: 'onCheckboxCancel'): void;
  // 选择框旁的删除按钮点击事件
  (e: 'onDeleteButtonClick'): void;
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

/**
 * 多选框选中事件
 * @param checked 是否选中
 */
const onCheckBoxChecked = (checked: boolean) => {
  if (checked) {
    emit('onChecked');
  } else {
    emit('onCheckboxCancel');
  }
};

/**
 * 删除按钮点击事件
 */
const onDeleteBtnClick = () => {
  emit('onDeleteButtonClick');
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
      <n-space style="line-height: 32px; height: 32px" inline>
        <n-checkbox
          v-if="showCheckbox ?? false"
          :checked="isChecked"
          :on-update-checked="onCheckBoxChecked"
        />
        <slot name="header-checkbox-button">
          <n-button
            type="error"
            size="small"
            style="margin-top: 2px"
            @click="onDeleteBtnClick"
            v-if="showDeleteButton"
          >
            <template #icon>
              <n-icon>
                <TrashIcon />
              </n-icon>
            </template>
          </n-button>
        </slot>

        <slot name="header">
          <div v-if="!globalVars.isSmallWindow">
            <span v-if="showPagination ?? true">
              当前页
              <MyNumberAnimation :to="currentPageItemCount ?? 0" />
              项
            </span>
            <span>
              ，共
              <MyNumberAnimation :to="dataCount ?? 0" />
              项
            </span>
          </div>
        </slot>
      </n-space>
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
