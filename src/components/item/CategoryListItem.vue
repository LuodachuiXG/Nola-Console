<!-- 分类列表项 -->
<script setup lang="ts">
import {
  NButton,
  NButtonGroup,
  NIcon,
  NListItem,
  NThing,
  NText,
  NCheckbox,
  NBadge
} from 'naive-ui';
import { Category } from '../../models/Category.ts';
import {
  SettingsOutline as SettingIcon,
  TrashOutline as TrashIcon
} from '@vicons/ionicons5';
import router from '../../router';
import { RouterViews } from '../../router/RouterViews.ts';
import { useGlobalStore } from '../../stores/GlobalStore.ts';

interface Props {
  /** 分类接口 */
  category: Category;
  /** 是否选中 **/
  isChecked: boolean;
}

const props = defineProps<Props>();

// 全局响应式变量
const globalStore = useGlobalStore();

const emit = defineEmits<{
  (e: 'onEditCategory', category: Category): void;
  (e: 'onDeleteCategory', category: Category): void;
  (e: 'onChecked', category: Category): void;
  (e: 'onUnChecked', category: Category): void;
}>();

const onEditCategory = (category: Category) => {
  emit('onEditCategory', category);
};

const onDeleteCategory = (category: Category) => {
  emit('onDeleteCategory', category);
};

/**
 * 选择框选中事件
 * @param checked
 */
const onCheckboxChecked = (checked: boolean) => {
  if (checked) {
    emit('onChecked', props.category);
  } else {
    emit('onUnChecked', props.category);
  }
};

/**
 * 文章数量 badge 点击事件
 */
const onPostCountBadgeClick = () => {
  // 跳转文章页并筛选当前分类
  router.push({
    name: RouterViews.POST.name,
    query: {
      categoryId: props.category.categoryId
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
          :value="category.postCount ?? 0"
          :offset="[10, 0]"
          type="info"
          @click="onPostCountBadgeClick"
        >
          <div>
            <n-text strong>{{ category.displayName }}</n-text>
          </div>
        </n-badge>
      </template>
      <template #description>
        <n-text depth="3">{{ category.slug }}</n-text>
      </template>
      <template #header-extra>
        <n-button-group size="small">
          <n-button type="default" tertiary @click="onEditCategory(category)">
            <template #icon>
              <n-icon>
                <SettingIcon />
              </n-icon>
            </template>
            <span v-if="!globalStore.isSmallWindow">设置</span>
          </n-button>
          <n-button type="error" tertiary @click="onDeleteCategory(category)">
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
