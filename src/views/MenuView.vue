<script setup lang="ts">
import MyCard from '../components/component/MyCard.vue';
import { NSelect, MenuOption, NInputGroup, NButton } from 'naive-ui';
import { onMounted, ref } from 'vue';
import { MenuItem } from '../models/MenuItem.ts';
import { Menu } from '../models/Menu.ts';
import { getMenuItems, getMenus, updateMenuItem } from '../apis/menuApi.ts';
import { errorMsg } from '../utils/Message.ts';
import MenuItemList from '../components/item/MenuItemList.vue';
import { MenuItemRequest } from '../models/request/MenuItemRequest.ts';

// 所有菜单
const menus = ref<Array<Menu> | null>(null);
// 主菜单 ID
const mainMenuId = ref(0);

// 菜单选择器选项
const menuOptions = ref<Array<MenuOption>>([]);
// 菜单选择器当前选择的菜单
const currentSelectMenu = ref<number | null>(null);

// 菜单项（非树形）
const menuItems = ref<Array<MenuItem>>([]);

onMounted(() => {
  // 获取所有菜单
  refreshMenus();
});

/**
 * 获取所有菜单
 */
const refreshMenus = () => {
  getMenus()
    .then((res) => {
      menus.value = res.data.data as Array<Menu>;
      // 获取主菜单
      menus.value.forEach((menu) => {
        if (menu.isMain) mainMenuId.value = menu.menuId;
      });

      menuOptions.value = [];
      // 将菜单添加到菜单选择器
      menus.value.forEach((menu) => {
        menuOptions.value?.push({
          label: menu.displayName + (menu.isMain ? '（主菜单）' : ''),
          value: menu.menuId
        });
      });

      // 菜单选择器默认选择主菜单
      currentSelectMenu.value = mainMenuId.value;

      // 获取主菜单所有菜单项
      refreshMenuItems(mainMenuId.value);
    })
    .catch((err) => errorMsg(err));
};

/**
 * 获取所有菜单项
 * @param menuId 菜单 ID
 */
const refreshMenuItems = (menuId: number) => {
  window.$loadingBar.start();
  getMenuItems(menuId, false)
    .then((res) => {
      window.$loadingBar.finish();
      menuItems.value = res.data as Array<MenuItem>;
    })
    .catch((err) => {
      window.$loadingBar.error();
      errorMsg(err);
    });
};

/**
 * 修改菜单项
 * @param menuItem 菜单项
 * @param onSuccess 成功回调
 */
const updateMItem = (menuItem: MenuItem, onSuccess?: () => void) => {
  let menuItemRequest: MenuItemRequest = {
    menuItemId: menuItem.menuItemId,
    displayName: menuItem.displayName,
    href: menuItem.href,
    target: menuItem.target,
    parentMenuId: menuItem.parentMenuId,
    parentMenuItemId: menuItem.parentMenuItemId,
    index: menuItem.index
  };
  updateMenuItem(menuItemRequest)
    .then(() => {
      // 修改成功
      onSuccess?.();
      // 刷新菜单
      refreshMenuItems(currentSelectMenu.value!!);
    })
    .catch((err) => errorMsg(err));
};

/**
 * 菜单选择器选项改变事件
 * @param value 菜单项数据（这里是菜单 ID）
 */
const onMenuSelectChang = (value: number) => {
  currentSelectMenu.value = value;
  refreshMenuItems(value);
};

/**
 * 菜单项更新事件
 * 包括：父菜单变更、索引位置变更
 * @param menuItem 改变后的菜单项
 */
const onMenuItemUpdate = (menuItem: MenuItem) => {
  // 更新菜单项
  updateMItem(menuItem);
};
</script>

<template>
  <div class="container">
    <my-card item-string="菜单">
      <template #header>
        <n-input-group>
          <n-select
            placeholder="选择菜单"
            style="min-width: 150px"
            :options="menuOptions"
            :consistent-menu-width="false"
            :value="currentSelectMenu"
            :on-update:value="onMenuSelectChang"
          />
          <n-button>管理</n-button>
        </n-input-group>
      </template>
      <template #content>
        <div class="content">
          <menu-item-list
            :menu-items="menuItems"
            @on-menu-item-update="onMenuItemUpdate"
          />
        </div>
      </template>
    </my-card>
  </div>
</template>

<style scoped></style>
