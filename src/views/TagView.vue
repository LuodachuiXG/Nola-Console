<script setup lang="ts">
import {
  NCard,
  NSpace,
  NTag,
  NScrollbar,
  NDropdown,
  NIcon,
  NButton
} from 'naive-ui';
import {
  BookOutline as BookIcon,
  TrashOutline as TrashIcon,
  BrushOutline as EditIcon
} from '@vicons/ionicons5';
import { Component, h, onMounted, ref } from 'vue';
import { allTags, delTagByIds } from '../apis/tagApi.ts';
import { Tag } from '../models/Tag.ts';
import { confirmDialog, errorMsg, successMsg } from '../utils/Message.ts';

// 标签集合
const tags = ref<Array<Tag> | null>(null);

// 当前点击的菜单索引
const currentClickMenuIndex = ref(-1);

// 标签点击显示的菜单项
const tagMenuOptions = [
  {
    label: '查看文章',
    key: 'viewPost',
    icon: renderIcon(BookIcon)
  },
  {
    type: 'divider'
  },
  {
    label: '编辑标签',
    key: 'edit',
    icon: renderIcon(EditIcon)
  },
  {
    label: '删除标签',
    key: 'delete',
    icon: renderIcon(TrashIcon)
  }
];

onMounted(() => {
  // 刷新标签数据
  refreshTags();
});

/**
 * 刷新标签数据
 */
const refreshTags = () => {
  allTags()
    .then((res) => {
      tags.value = res.data;
    })
    .catch((err) => {
      errorMsg(err)
    });
};

/**
 * 渲染图标
 */
function renderIcon(icon: Component) {
  return () => h(NIcon, null, { default: () => h(icon) });
}

/**
 * 标签菜单选择事件
 * @param key 菜单 key
 */
const onTagMenuSelect = (key: string) => {
  let currentTag = tags.value?.[currentClickMenuIndex.value];
  switch (key) {
    case 'delete':
      // 删除标签
      confirmDialog(
        '确定要删除标签 [' + currentTag?.displayName + '] 吗？此操作不可逆。',
        () => {
          // 删除标签
          delTagByIds([currentTag?.tagId!!]).then(() => {
            // 删除成功
            successMsg('删除成功');
            // 刷新标签列表
            refreshTags();
          }).catch((err) => {
            errorMsg(err);
          });
        }
      );
      break;
  }
};
</script>

<template>
  <div class="container">
    <n-card
      :title="(tags?.length ?? '0') + ' 个标签'"
      :segmented="{
        content: true
      }"
      content-style="padding: 0;"
      size="small"
    >
      <template #header-extra>
        <n-button type="primary">添加标签</n-button>
      </template>
      <template #default>
        <n-scrollbar style="max-height: calc(100vh - 184px)">
          <div style="padding: 10px">
            <n-space>
              <div
                v-for="(tag, index) in tags"
                @click="currentClickMenuIndex = index"
              >
                <n-dropdown
                  trigger="click"
                  :options="tagMenuOptions"
                  show-arrow
                  @select="onTagMenuSelect"
                >
                  <n-tag
                    class="tag"
                    size="small"
                    :color="
                      tag.color !== null && tag.color !== ''
                        ? { textColor: tag.color, borderColor: tag.color }
                        : {}
                    "
                  >
                    <span
                      :class="
                        tag.color !== null && tag.color !== ''
                          ? 'tag-text-shadow'
                          : ''
                      "
                      >{{ tag.displayName }}</span
                    >
                  </n-tag>
                </n-dropdown>
              </div>
            </n-space>
          </div>
        </n-scrollbar>
      </template>
      <template #action>所有标签</template>
    </n-card>
  </div>
</template>

<style scoped>
.tag {
  cursor: pointer;
}
.tag-text-shadow {
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.3);
}
</style>
