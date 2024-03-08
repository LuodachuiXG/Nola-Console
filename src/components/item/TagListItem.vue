<!-- 标签列表项 -->
<script setup lang="ts">
import {
  NButton,
  NButtonGroup,
  NIcon,
  NListItem,
  NThing,
  NBadge,
  NText
} from 'naive-ui';
import {
  BrushOutline as EditIcon,
  TrashOutline as TrashIcon
} from '@vicons/ionicons5';
import { Tag } from '../../models/Tag.ts';
import TagComponent from '../component/MyTag.vue';

interface Props {
  /** 标签类 **/
  tag: Tag;
  /** 是否折叠元素 **/
  isCollapsed?: boolean;
}

defineProps<Props>();


const emit = defineEmits<{
  (e: 'onEditTag', tag: Tag): void;
  (e: 'onDeleteTag', tag: Tag): void;
}>();

/**
 * 编辑标签事件
 * @param tag 标签
 */
const onEditTag = (tag: Tag) => {
  emit('onEditTag', tag);
};

/**
 * 删除标签事件
 * @param tag 标签
 */
const onDeleteTag = (tag: Tag) => {
  emit('onDeleteTag', tag);
};
</script>

<template>
  <n-list-item>
    <n-thing class="animate__animated animate__fadeIn">
      <template #header>
        <n-badge :value="tag.postCount ?? 0" type="info">
          <tag-component size="medium" :tag="tag" />
        </n-badge>
      </template>
      <template #description>
        <div class="description">
          <n-text depth="3">{{ tag.slug }}</n-text>
        </div>
      </template>
      <template #header-extra>
        <n-button-group size="small">
          <n-button type="default" tertiary @click="onEditTag(tag)">
            <template #icon>
              <n-icon>
                <EditIcon />
              </n-icon>
            </template>
            <span v-if="!isCollapsed ?? true">编辑</span>
          </n-button>
          <n-button type="error" tertiary @click="onDeleteTag(tag)">
            <template #icon>
              <n-icon>
                <TrashIcon />
              </n-icon>
            </template>
            <span v-if="!isCollapsed ?? true">删除</span>
          </n-button>
        </n-button-group>
      </template>
    </n-thing>
  </n-list-item>
</template>
<style scoped></style>