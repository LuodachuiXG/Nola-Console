<script setup lang="ts">
import { NList } from 'naive-ui';
import { MenuItem } from '../../models/MenuItem.ts';
import { onMounted, ref, watch } from 'vue';
import MenuItemListItem from './MenuItemListItem.vue';
import { cloneDeep } from 'lodash';

interface Props {
  /** 菜单项列表 */
  menuItems: Array<MenuItem>;
}

const props = defineProps<Props>();

// 菜单项列表（树形）
const menuItemsTree = ref<Array<MenuItem>>([]);

// 菜单项层级，用于计算缩进，Key: menuItemId，Value: 层级
const menuItemLevel = new Map<number, number>();

const emit = defineEmits<{
  (e: 'onMenuItemUpdate', menuItem: MenuItem): void;
}>();

onMounted(() => {
  watch(
    () => props.menuItems,
    () => {
      if (props.menuItems.length > 0) {
        handleMenuItemChange();
      }
    }
  );
});

/**
 * 处理菜单项变化
 */
const handleMenuItemChange = () => {
  // 将菜单项列表转换为树形
  menuItemsTree.value = findMenuItemChildren(null, props.menuItems);
  // 计算每个菜单项的层级
  menuItemLevel.clear();
  calculateMenuItemLevel(menuItemsTree.value);
};

/**
 * 构建菜单项树形
 * @param parentMenuItemId 父菜单项 ID
 * @param items 菜单项列表
 */
const findMenuItemChildren = (
  parentMenuItemId: number | null,
  items: Array<MenuItem>
): Array<MenuItem> => {
  return items
    .filter((item) => item.parentMenuItemId === parentMenuItemId)
    .map((item) => {
      const newMenuItem = cloneDeep(item);
      newMenuItem.children = findMenuItemChildren(
        newMenuItem.menuItemId,
        items
      );
      return newMenuItem;
    });
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

/**
 * 菜单项移动事件
 * @param menuItem 改变的菜单项（菜单项中的父菜单项 ID 和 index 需要重新计算）
 */
const onMenuItemMoved = (menuItem: MenuItem) => {
  // 查找目标菜单项的父菜单 ID 和 index 索引位置
  let result = searchInChildren(menuItemsTree.value, menuItem.menuItemId);
  let newMenuItem = { ...menuItem };
  newMenuItem.parentMenuItemId = result.parentId;
  newMenuItem.index = result.index;
  // 更新菜单项
  emit('onMenuItemUpdate', newMenuItem);
};

/**
 * 查找目标菜单项的父菜单 ID 和 index 索引位置
 * @param menuItems 菜单项列表
 * @param targetMenuItemId 目标菜单项 ID
 */
const searchInChildren = (
  menuItems: MenuItem[],
  targetMenuItemId: number
): {
  parentId: number | null;
  index: number;
} => {
  for (let i = 0; i < menuItems.length; i++) {
    const menuItem = menuItems[i];

    if (menuItem.menuItemId === targetMenuItemId) {
      return { parentId: null, index: i };
    }

    if (menuItem.children?.length > 0) {
      const foundInfo = searchInChildren(menuItem.children, targetMenuItemId);
      if (foundInfo.index !== -1) {
        return {
          parentId:
            foundInfo.parentId !== null
              ? foundInfo.parentId
              : menuItem.menuItemId,
          index: foundInfo.index
        };
      }
    }
  }

  // 未找到目标菜单项
  return { parentId: null, index: -1 };
};
</script>

<template>
  <div class="container">
    <n-list hoverable id="moveContainer">
      <menu-item-list-item
        :menu-item-level="menuItemLevel"
        :menu-items="menuItemsTree"
        @on-menu-item-moved="onMenuItemMoved"
      />
    </n-list>
  </div>
</template>

<style scoped></style>
