<script setup lang="ts">
import { NList } from 'naive-ui';
import { MenuItem } from '../../models/MenuItem.ts';
import { onMounted, ref, watch } from 'vue';
import MenuItemListItem from './MenuItemListItem.vue';

interface Props {
  /** 菜单项列表 */
  menuItems: Array<MenuItem>;
}

const props = defineProps<Props>();

// 菜单项列表（树形）
const menuItemsTree = ref<Array<MenuItem>>([]);

// 菜单项层级，用于计算缩进，Key: menuItemId，Value: 层级
const menuItemLevel = new Map<number, number>();

onMounted(() => {
  watch(
    () => props.menuItems,
    () => handleMenuItemChange(),
    { immediate: true }
  );
});

/**
 * 处理菜单项变化
 */
const handleMenuItemChange = () => {
  // 计算每个菜单项的层级
  menuItemLevel.clear();
  calculateMenuItemLevel(props.menuItems);
  // 将菜单项列表转换为树形
  menuItemsTree.value = buildMenuItemTree(props.menuItems);
};

/**
 * 构建菜单项树形
 * @param items 菜单项列表
 */
const buildMenuItemTree = (items: Array<MenuItem>): Array<MenuItem> => {
  const menuMap = new Map<number, MenuItem>();

  // 将原始数据中的每个菜单项添加到映射表中以便查找
  items.forEach((item) => {
    menuMap.set(item.menuItemId, { ...item });
  });

  // 遍历原始数据并构建子菜单项
  items.forEach((item) => {
    if (item.parentMenuItemId !== null) {
      const parentItem = menuMap.get(item.parentMenuItemId);
      if (parentItem) {
        // 如果找到父菜单项，则将当前菜单项添加到其 children 属性中
        if (!parentItem.children) {
          parentItem.children = [];
        }
        parentItem.children.push(item);
      }
    }
  });

  // 返回所有顶级菜单项（即 parentMenuItemId 为 null 的项）
  return Array.from(menuMap.values()).filter(
    (item) => item.parentMenuItemId === null
  );
};

/**
 * 计算菜单项层级
 * @param menuItems 菜单项列表
 */
const calculateMenuItemLevel = (menuItems: Array<MenuItem>) => {
  for (const menuItem of menuItems) {
    const parentLevel =
      menuItem.parentMenuItemId !== null
        ? menuItemLevel.get(menuItem.parentMenuItemId) || 0
        : 0;
    const level = parentLevel + 1;
    menuItemLevel.set(menuItem.menuItemId, level);
    if (menuItem.children.length > 0) {
      calculateMenuItemLevel(menuItem.children);
    }
  }
};
</script>

<template>
  <div class="container">
    <n-list hoverable>
      <menu-item-list-item
        v-for="menuItem in menuItemsTree"
        :key="menuItem.menuItemId"
        :menu-item-level="menuItemLevel"
        :menu-item="menuItem"
      />
    </n-list>
  </div>
</template>

<style scoped></style>
