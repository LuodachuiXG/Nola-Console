<!-- 标签列表项 -->
<script setup lang="ts">
import {
  NButton,
  NButtonGroup,
  NIcon,
  NListItem,
  NThing,
  NBadge,
  NText,
  NCheckbox
} from 'naive-ui';
import {
  SettingsOutline as SettingIcon,
  TrashOutline as TrashIcon
} from '@vicons/ionicons5';
import { Tag } from '../../models/Tag.ts';
import TagComponent from '../component/MyTag.vue';
import router from '../../router';
import { RouterViews } from '../../router/RouterViews.ts';
import { useGlobalStore } from '../../stores/GlobalStore.ts';

interface Props {
  /** 标签接口 **/
  tag: Tag;
  /** 是否选中 **/
  isChecked: boolean;
}

const props = defineProps<Props>();

// 全局响应式变量
const globalStore = useGlobalStore();

const emit = defineEmits<{
  (e: 'onEditTag', tag: Tag): void;
  (e: 'onDeleteTag', tag: Tag): void;
  (e: 'onChecked', tag: Tag): void;
  (e: 'onUnChecked', tag: Tag): void;
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

/**
 * 选择框选中事件
 * @param checked
 */
const onCheckboxChecked = (checked: boolean) => {
  if (checked) {
    emit('onChecked', props.tag);
  } else {
    emit('onUnChecked', props.tag);
  }
};

/**
 * 文章数量 Badge 点击事件
 */
const onPostCountBadgeClick = () => {
  // 跳转到文章列表页面
  router.push({
    name: RouterViews.POST.name,
    query: {
      tagId: props.tag.tagId
    }
  });
};
</script>

<template>
  <n-list-item>
    <n-thing class="animate__animated animate__fadeIn">
      <template #avatar>
        <div style="margin-right: -10px">
          <n-checkbox
            :checked="isChecked"
            style="margin-left: -4px; margin-right: 12px"
            @update-checked="onCheckboxChecked"
          />
        </div>
      </template>
      <template #header>
        <n-badge
          class="none-select pointer"
          :value="tag.postCount ?? 0"
          type="info"
          @click="onPostCountBadgeClick"
        >
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
                <SettingIcon />
              </n-icon>
            </template>
            <span v-if="!globalStore.isSmallWindow">设置</span>
          </n-button>
          <n-button type="error" tertiary @click="onDeleteTag(tag)">
            <template #icon>
              <n-icon>
                <TrashIcon />
              </n-icon>
            </template>
            <span v-if="!globalStore.isSmallWindow">删除</span>
          </n-button>
        </n-button-group>
      </template>
    </n-thing>
  </n-list-item>
</template>
<style scoped></style>
