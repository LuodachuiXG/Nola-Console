<!-- 分类列表项 -->
<script setup lang="ts">
import { NButton, NButtonGroup, NIcon, NListItem, NThing } from 'naive-ui';
import { Category } from '../../models/Category.ts';
import {
  BrushOutline as EditIcon,
  TrashOutline as TrashIcon
} from '@vicons/ionicons5';

interface Props {
  /** 分类列表 */
  category: Category;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'onEditCategory', category: Category): void
  (e: 'onDeleteCategory', category: Category): void
}>();

const onEditCategory = (category: Category) => {
  emit('onEditCategory', category);
};

const onDeleteCategory = (category: Category) => {
  emit('onDeleteCategory', category);
};
</script>

<template>
  <n-list-item>
    <n-thing class="animate__animated animate__fadeIn">
      <template #header>
        {{ category.displayName }}
      </template>
      <template #description>
        <n-button text text-color="#999">{{ category.slug }}</n-button>
      </template>
      <template #header-extra>
        <n-button-group size="small">
          <n-button type="default" tertiary @click="onEditCategory(category)">
            <template #icon>
              <n-icon>
                <EditIcon />
              </n-icon>
            </template>
            编辑
          </n-button>
          <n-button type="error" tertiary @click="onDeleteCategory(category)">
            <template #icon>
              <n-icon>
                <TrashIcon />
              </n-icon>
            </template>
            删除
          </n-button>
        </n-button-group>
      </template>
    </n-thing>
  </n-list-item>
</template>

<style scoped></style>
