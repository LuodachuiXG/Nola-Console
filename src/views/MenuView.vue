<script setup lang="ts">
import MyCard from '../components/component/MyCard.vue';
import {
  MenuOption,
  SelectOption,
  FormInst,
  NButton,
  NIcon,
  NInputGroup,
  NSelect,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NDropdown,
  NSwitch
} from 'naive-ui';
import {
  AddOutline as AddIcon,
  BrushOutline as EditIcon,
  TrashOutline as TrashIcon,
  SettingsOutline as SettingIcon
} from '@vicons/ionicons5';
import { inject, onMounted, reactive, ref } from 'vue';
import { MenuItem } from '../models/MenuItem.ts';
import { Menu } from '../models/Menu.ts';
import {
  addMenu,
  addMenuItem,
  delMenu,
  delMenuItem,
  getMenuItems,
  getMenus,
  updateMenu,
  updateMenuItem
} from '../apis/menuApi.ts';
import { confirmDialog, errorMsg, successMsg } from '../utils/Message.ts';
import MenuItemList from '../components/item/MenuItemList.vue';
import { MenuItemRequest } from '../models/request/MenuItemRequest.ts';
import { DialogFormMode } from '../models/enum/DialogFormMode.ts';
import { MenuItemTarget } from '../models/enum/MenuItemTarget.ts';
import { renderIcon } from '../utils/MyUtils.ts';

const globalVars: GlobalVars = inject('globalVars')!!;

// 所有菜单
const menus = ref<Array<Menu> | null>(null);
// 菜单项（非树形）
const menuItems = ref<Array<MenuItem>>([]);
// 主菜单 ID
const mainMenuId = ref<number | null>(null);

// 菜单选择器选项
const menuOptions = ref<Array<MenuOption>>([]);
// 菜单选择器当前选择的菜单
const currentSelectMenu = ref<number | null>(null);
// 菜单管理下拉菜单选项
const menuManagerOptions: Array<SelectOption> = [
  {
    label: '添加菜单',
    key: 'add',
    icon: renderIcon(AddIcon)
  },
  {
    label: '修改菜单',
    key: 'update',
    icon: renderIcon(EditIcon)
  },
  {
    label: '删除菜单',
    key: 'del',
    icon: renderIcon(TrashIcon)
  },
  {
    type: 'divider'
  },
  {
    label: '设为主菜单',
    key: 'main',
    icon: renderIcon(SettingIcon)
  }
];

// 是否显示菜单设置添加模态框
const visibleMenuDialog = ref(false);
// 菜单模态框模式
const menuDialogMode = ref<DialogFormMode>(DialogFormMode.ADD);
// 菜单模态框是否在加载中
const isMenuDialogLoading = ref(false);
// 菜单对话框引用
const menuDialogRef = ref<FormInst | null>(null);
// 菜单模态框表单数据
const formMenu: Menu = reactive({
  menuId: -1,
  displayName: '',
  isMain: false,
  // 下面参数仅用于满足接口，没有实际作用
  createTime: 0
});

// 是否显示菜单项设置添加模态框
const visibleMenuItemDialog = ref(false);
// 菜单项模态框模式
const menuItemDialogMode = ref<DialogFormMode>(DialogFormMode.ADD);
// 菜单项模态框是否在加载中
const isMenuItemDialogLoading = ref(false);
// 菜单项对话框引用
const menuItemDialogRef = ref<FormInst | null>(null);
// 菜单项模态框表单数据
const formMenuItem: MenuItemRequest = reactive({
  menuItemId: undefined,
  displayName: '',
  href: '',
  target: MenuItemTarget.BLANK,
  parentMenuId: -1,
  parentMenuItemId: null,
  index: 0
});
// 菜单项打开方式选择器选项
const menuItemTargetOptions = [
  {
    label: '新窗口',
    value: MenuItemTarget.BLANK
  },
  {
    label: '当前窗口',
    value: MenuItemTarget.SELF
  },
  {
    label: '父窗口',
    value: MenuItemTarget.PARENT
  },
  {
    label: '顶级窗口',
    value: MenuItemTarget.TOP
  }
];
// 菜单项父菜单项选择器选项
const menuItemParentMenuItemsOptions = ref(Array<SelectOption>());

// 当前选择的菜单项 ID 数组
const currentSelectMenuItemIds = ref(Array<number>());

onMounted(() => {
  // 获取所有菜单
  refreshMenus();
});

/**
 * 获取所有菜单
 * @param showMenuId 刷新时，显示那个菜单的菜单项
 *                   number: 显示给定的菜单 ID 的菜单项。
 *                   null: 自动获取主菜单，并显示主菜单的菜单项
 */
const refreshMenus = (showMenuId: number | null = null) => {
  getMenus()
    .then((res) => {
      menus.value = res.data.data as Array<Menu>;
      if (showMenuId === null) {
        // 获取主菜单
        menus.value.forEach((menu) => {
          if (menu.isMain) mainMenuId.value = menu.menuId;
        });
        // 如果主菜单不存在，则默认选择第一个菜单
        if (mainMenuId.value === null && menus.value?.length > 0) {
          mainMenuId.value = menus.value[0].menuId;
        }

        // 菜单选择器默认选择主菜单
        currentSelectMenu.value = mainMenuId.value;
      } else {
        // 菜单选择器默认选择给定的菜单
        currentSelectMenu.value = showMenuId;
      }
      // 获取当前选择的菜单的所有菜单项
      refreshMenuItems(currentSelectMenu.value);

      menuOptions.value = [];
      // 将菜单添加到菜单选择器
      menus.value.forEach((menu) => {
        menuOptions.value?.push({
          label: menu.displayName + (menu.isMain ? '（主菜单）' : ''),
          value: menu.menuId
        });
      });
    })
    .catch((err) => errorMsg(err));
};

/**
 * 获取所有菜单项
 * @param menuId 菜单 ID
 */
const refreshMenuItems = (menuId: number | null) => {
  if (menuId === null) return;
  window.$loadingBar.start();
  getMenuItems(menuId, false)
    .then((res) => {
      window.$loadingBar.finish();
      menuItems.value = res.data as Array<MenuItem>;
      // 刷新菜单项成功后清空选择的菜单项
      currentSelectMenuItemIds.value = [];
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
 * 根据菜单 ID 获取菜单
 * @param menuId
 */
const getMenuById = (menuId: number): Menu | null => {
  for (let i = 0; i < menus.value!!.length ?? 0; i++) {
    const menu = menus.value!![i];
    if (menu.menuId === menuId) return menu;
  }
  return null;
};

/**
 * 菜单项选择器管理器选项选择事件
 * @param value
 */
const onMenuManagerSelect = (value: string) => {
  let menu = getMenuById(currentSelectMenu.value!!);
  if (menu === null && value !== 'add') {
    errorMsg('请先选择菜单');
    return;
  }
  switch (value) {
    case 'add':
      initMenuDialog();
      menuDialogMode.value = DialogFormMode.ADD;
      break;
    case 'del':
      confirmDialog(
        `确定要删除菜单 [${menu!!.displayName}] 吗？该菜单的子菜单项也会一并删除`,
        () => deleteMenus([menu!!.menuId])
      );
      break;
    case 'update':
      initMenuDialog();
      menuDialogMode.value = DialogFormMode.EDIT;
      formMenu.menuId = menu!!.menuId;
      formMenu.displayName = menu!!.displayName;
      formMenu.isMain = menu!!.isMain;
      break;
    case 'main':
      updateMenu(menu!!.menuId, menu!!.displayName, true)
        .then(() => {
          // 更新成功，刷新菜单
          refreshMenus();
        })
        .catch((err) => errorMsg(err));
      break;
  }
};

/**
 * 批量删除菜单
 * @param ids 菜单 ID 数组
 */
const deleteMenus = (ids: Array<number>) => {
  delMenu(ids)
    .then(() => {
      successMsg('删除成功');
      // 如果主菜单被删除，则当前主菜单变量设为为 null
      if (ids.includes(mainMenuId.value ?? -1)) {
        mainMenuId.value = null;
      }
      // 刷新菜单
      refreshMenus();
    })
    .catch((err) => errorMsg(err));
};

/**
 * 初始化（显示）菜单模态框
 */
const initMenuDialog = () => {
  // 先清空表单
  clearFormMenu();
  // 显示模态框
  visibleMenuDialog.value = true;
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

/**
 * 菜单模态框提交事件
 */
const onMenuDialogSubmit = () => {
  // 验证表单
  menuDialogRef.value
    ?.validate((error) => {
      if (!error) {
        isMenuDialogLoading.value = true;
        if (menuDialogMode.value === DialogFormMode.ADD) {
          // 添加菜单
          addMenu(formMenu.displayName, formMenu.isMain)
            .then((res) => {
              const newMenu = res.data as Menu;
              isMenuDialogLoading.value = false;
              visibleMenuDialog.value = false;
              successMsg('添加成功');
              // 刷新菜单
              refreshMenus(newMenu.menuId);
            })
            .catch((err) => {
              isMenuDialogLoading.value = false;
              errorMsg(err);
            });
        } else {
          // 修改菜单
          updateMenu(formMenu.menuId, formMenu.displayName, formMenu.isMain)
            .then(() => {
              isMenuDialogLoading.value = false;
              visibleMenuDialog.value = false;
              successMsg('修改成功');
              // 刷新菜单
              refreshMenus(formMenu.menuId);
            })
            .catch((err) => {
              isMenuDialogLoading.value = false;
              errorMsg(err);
            });
        }
      }
    })
    .catch(() => {});
};

/**
 * 清空菜单表单
 */
const clearFormMenu = () => {
  formMenu.menuId = -1;
  formMenu.isMain = false;
  formMenu.displayName = '';
};

/**
 * 清空菜单项表单
 */
const clearFormMenuItem = () => {
  formMenuItem.menuItemId = undefined;
  formMenuItem.displayName = '';
  formMenuItem.href = '';
  formMenuItem.target = MenuItemTarget.BLANK;
  formMenuItem.parentMenuId = -1;
  formMenuItem.parentMenuItemId = null;
  formMenuItem.index = 0;
};

/**
 * 菜单项模态框提交事件
 */
const onMenuItemDialogSubmit = () => {
  // 验证表单
  menuItemDialogRef.value
    ?.validate((errors) => {
      if (!errors) {
        isMenuItemDialogLoading.value = true;
        if (menuItemDialogMode.value === DialogFormMode.ADD) {
          // 当前是添加菜单项模式
          addMenuItem(formMenuItem)
            .then(() => {
              visibleMenuItemDialog.value = false;
              isMenuItemDialogLoading.value = false;
              successMsg('添加成功');
              // 刷新菜单项目
              refreshMenuItems(currentSelectMenu.value!!);
            })
            .catch((err) => {
              isMenuItemDialogLoading.value = false;
              errorMsg(err);
            });
        } else {
          // 当前是修改菜单项模式
          updateMenuItem(formMenuItem)
            .then(() => {
              visibleMenuItemDialog.value = false;
              isMenuItemDialogLoading.value = false;
              successMsg('修改成功');
              // 刷新菜单项目
              refreshMenuItems(currentSelectMenu.value!!);
            })
            .catch((err) => errorMsg(err));
        }
      }
    })
    .catch(() => {});
  return false;
};

/**
 * 添加菜单项按钮点击事件
 */
const onAddMenuItemClick = () => {
  // 先清空表单
  clearFormMenuItem();
  // 将当前菜单 ID 填充到表单
  formMenuItem.parentMenuId = currentSelectMenu.value!!;
  // 将菜单项填充到父菜单选择器选项
  fillParentMenuItemsOptions();
  // 显示模态框
  visibleMenuItemDialog.value = true;
};

/**
 * 填充父菜单项选择器选项
 * @param exceptId 要排除的 ID
 */
const fillParentMenuItemsOptions = (exceptId: number | null = null) => {
  menuItemParentMenuItemsOptions.value = [];
  menuItems.value.forEach((menuItem) => {
    if (menuItem.menuItemId != exceptId) {
      menuItemParentMenuItemsOptions.value.push({
        label: menuItem.displayName,
        value: menuItem.menuItemId
      });
    }
  });
};

/**
 * 菜单项设置按钮点击事件
 * @param menuItem 菜单项
 */
const onMenuItemSettingClick = (menuItem: MenuItem) => {
  // 先清空表单
  clearFormMenuItem();
  // 将当前菜单 ID 填充到表单
  formMenuItem.parentMenuId = currentSelectMenu.value!!;
  // 将当前菜单项数据填充到表单
  formMenuItem.menuItemId = menuItem.menuItemId;
  formMenuItem.displayName = menuItem.displayName;
  formMenuItem.href = menuItem.href;
  formMenuItem.target = menuItem.target;
  formMenuItem.parentMenuItemId = menuItem.parentMenuItemId;
  formMenuItem.parentMenuId = menuItem.parentMenuId;
  formMenuItem.index = menuItem.index;
  // 设置当前为编辑模式
  menuItemDialogMode.value = DialogFormMode.EDIT;
  // 将菜单项填充到父菜单选择器选项
  fillParentMenuItemsOptions();
  // 显示模态框
  visibleMenuItemDialog.value = true;
};

/**
 * 菜单项添加子菜单项按钮点击事件
 * @param menuItem 菜单项
 */
const onMenuItemAddSubMenuItemClick = (menuItem: MenuItem) => {
  // 首先清空表单
  clearFormMenuItem();
  // 将当前菜单 ID 填充到表单
  formMenuItem.parentMenuId = currentSelectMenu.value!!;
  // 将当前菜单项 ID 填充到表单
  formMenuItem.parentMenuItemId = menuItem.menuItemId;
  // 将菜单项填充到父菜单选择器选项
  fillParentMenuItemsOptions();
  // 显示模态框
  visibleMenuItemDialog.value = true;
};

/**
 * 菜单项删除按钮点击事件
 * @param menuItem 菜单项
 */
const onMenuItemDeleteClick = (menuItem: MenuItem) => {
  confirmDialog(
    `确定要删除菜单项 [${menuItem.displayName}] 吗？子菜单项将会一并删除。`,
    () => {
      deleteMenuItems([menuItem.menuItemId]);
    }
  );
};

/**
 * 批量删除菜单项
 * @param ids 菜单项 ID 数组
 */
const deleteMenuItems = (ids: Array<number>) => {
  delMenuItem(ids)
    .then(() => {
      successMsg('删除成功');
      // 刷新菜单项
      refreshMenuItems(currentSelectMenu.value!!);
    })
    .catch((err) => errorMsg(err));
};

/**
 * 菜单项全选事件
 */
const onMenuItemCheckedAll = () => {
  currentSelectMenuItemIds.value = [];
  menuItems.value?.forEach((menuItem) => {
    currentSelectMenuItemIds.value.push(menuItem.menuItemId);
  });
};

/**
 * 菜单项取消全选事件
 */
const onMenuItemCancelChecked = () => {
  currentSelectMenuItemIds.value = [];
};

/**
 * 菜单项多选删除点击事件
 */
const onMenuItemsDeleteClick = () => {
  let ids = Array<number>();
  currentSelectMenuItemIds.value.forEach((id) => {
    ids.push(id);
  });
  confirmDialog(`确定要删除选择的 ${ids.length} 个菜单项吗？子菜单项将会一并删除。`, () => {
    deleteMenuItems(ids);
  });
};

/**
 * 菜单项选中事件
 * @param menuItem
 */
const onMenuItemChecked = (menuItem: MenuItem) => {
  currentSelectMenuItemIds.value.push(menuItem.menuItemId);
};

/**
 * 菜单项取消选中事件
 * @param menuItem
 */
const onMenuItemUnChecked = (menuItem: MenuItem) => {
  currentSelectMenuItemIds.value = currentSelectMenuItemIds.value.filter((id) => {
    return id !== menuItem.menuItemId;
  });
};
</script>

<template>
  <div class="container">
    <!-- 添加 / 设置菜单模态框 -->
    <n-modal
      v-model:show="visibleMenuDialog"
      preset="dialog"
      :title="menuDialogMode == DialogFormMode.ADD ? '添加菜单' : '菜单设置'"
      :positive-text="menuDialogMode == DialogFormMode.ADD ? '添加' : '保存'"
      negative-text="取消"
      :loading="isMenuDialogLoading"
      @positiveClick="onMenuDialogSubmit"
      @keydown.enter="onMenuDialogSubmit"
    >
      <template #default>
        <n-form ref="menuDialogRef" class="dialog-form" :model="formMenu">
          <n-form-item
            label="菜单名"
            path="displayName"
            :rule="{ required: true, message: '请输入名称' }"
          >
            <n-input
              v-model:value="formMenu.displayName"
              placeholder="菜单名称"
              maxlength="256"
            />
          </n-form-item>
          <n-form-item label="是否是主菜单" path="isMain">
            <n-switch v-model:value="formMenu.isMain" />
          </n-form-item>
        </n-form>
      </template>
    </n-modal>

    <!-- 添加 / 设置菜单项模态框 -->
    <n-modal
      v-model:show="visibleMenuItemDialog"
      preset="dialog"
      :title="
        menuItemDialogMode == DialogFormMode.ADD ? '添加菜单项' : '菜单项设置'
      "
      :positive-text="
        menuItemDialogMode == DialogFormMode.ADD ? '添加' : '保存'
      "
      negative-text="取消"
      :loading="isMenuItemDialogLoading"
      @positiveClick="onMenuItemDialogSubmit"
      @keydown.enter="onMenuItemDialogSubmit"
    >
      <template #default>
        <n-form
          ref="menuItemDialogRef"
          class="dialog-form"
          :model="formMenuItem"
        >
          <n-form-item
            label="菜单项名称"
            path="displayName"
            :rule="{ required: true, message: '请输入名称' }"
          >
            <n-input
              v-model:value="formMenuItem.displayName"
              placeholder="菜单项名称"
              maxlength="256"
            />
          </n-form-item>
          <n-form-item
            label="地址"
            path="href"
            :rule="{ required: true, message: '请输入地址' }"
          >
            <n-input
              v-model:value="formMenuItem.href"
              placeholder="地址"
              maxlength="512"
            />
          </n-form-item>
          <n-form-item label="打开方式" path="target">
            <n-select
              :options="menuItemTargetOptions"
              v-model:value="formMenuItem.target"
            />
          </n-form-item>
          <n-form-item label="父菜单项" path="parentMenuItemId">
            <n-select
              :options="menuItemParentMenuItemsOptions"
              v-model:value="formMenuItem.parentMenuItemId"
              clearable
            />
          </n-form-item>
        </n-form>
      </template>
    </n-modal>

    <my-card
      item-string="菜单"
      :show-empty-status="menuItems.length === 0"
      show-checkbox
      @on-checked="onMenuItemCheckedAll"
      @on-checkbox-cancel="onMenuItemCancelChecked"
      :is-checked="
        currentSelectMenuItemIds.length === menuItems?.length && menuItems.length !== 0
      "
      :show-delete-button="currentSelectMenuItemIds.length > 0"
      @on-delete-button-click="onMenuItemsDeleteClick"
    >
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

          <n-dropdown
            trigger="click"
            :options="menuManagerOptions"
            show-arrow
            @select="onMenuManagerSelect"
          >
            <n-button>管理</n-button>
          </n-dropdown>
        </n-input-group>
      </template>
      <template #header-extra>
        <n-button type="primary" @click="onAddMenuItemClick">
          <template #icon>
            <n-icon>
              <AddIcon />
            </n-icon>
          </template>
          <span v-if="!globalVars.isSmallWindow">添加菜单项</span>
        </n-button>
      </template>
      <template #content>
        <div class="content">
          <menu-item-list
            :menu-items="menuItems"
            :selected-menu-item="currentSelectMenuItemIds"
            @on-menu-item-update="onMenuItemUpdate"
            @on-setting-menu-item="onMenuItemSettingClick"
            @on-add-sub-menu-item="onMenuItemAddSubMenuItemClick"
            @on-del-menu-item="onMenuItemDeleteClick"
            @on-un-checked="onMenuItemUnChecked"
            @on-checked="onMenuItemChecked"
          />
        </div>
      </template>
    </my-card>
  </div>
</template>

<style scoped></style>
