<script setup lang="ts">
import {
  NButton,
  NListItem,
  NText,
  NThing,
  NButtonGroup,
  NIcon,
  NCheckbox
} from 'naive-ui';
import { MenuItem } from '../../models/MenuItem.ts';
import {
  SettingsOutline as SettingIcon,
  TrashOutline as TrashIcon,
  AddOutline as AddIcon
} from '@vicons/ionicons5';
import draggable from 'vuedraggable';
import { inject } from 'vue';

interface Props {
  /** 菜单项层级 **/
  menuItemLevel: Map<number, number>;
  /** 选择的菜单项 **/
  selectedMenuItem: Array<number>;
}

const emit = defineEmits<{
  (e: 'onMenuItemMoved', menuItem: MenuItem): void;
  (e: 'onSettingMenuItem', menuItem: MenuItem): void;
  (e: 'onAddSubMenuItem', menuItem: MenuItem): void;
  (e: 'onDelMenuItem', menuItem: MenuItem): void;
  (e: 'onChecked', menuItem: MenuItem): void;
  (e: 'onUnChecked', menuItem: MenuItem): void;
}>();

defineProps<Props>();

const globalVars: GlobalVars = inject('globalVars')!!;

const menuItems = defineModel('menuItems', {
  type: Array<MenuItem>,
  required: true,
  default: []
});

/**
 * 菜单项拖拽组件停止拖拽事件
 * @param event
 */
const onDraggableEnd = (event: MoveChangeEvent<MenuItem>) => {
  if (event.moved) {
    // 菜单在同级内移动
    emit('onMenuItemMoved', event.moved.element);
    return;
  } else if (event.added) {
    // 菜单项跨级移动
    emit('onMenuItemMoved', event.added.element);
    return;
  }
};

/**
 * 选择框选中事件
 * @param checked 是否选中
 * @param menuItem 触发事件的菜单项
 */
const onCheckboxChecked = (checked: boolean, menuItem: MenuItem) => {
  if (checked) {
    emit('onChecked', menuItem);
  } else {
    emit('onUnChecked', menuItem);
  }
};
</script>

<template>
  <draggable
    :group="{ name: 'g1' }"
    item-key="menuItemId"
    v-model:list="menuItems"
    @change="onDraggableEnd"
    @drag=""
  >
    <template #item="{ element }">
      <div>
        <n-list-item
          :style="{
            marginLeft:
              ((menuItemLevel.get(element.menuItemId) ?? 0) - 1) * 30 + 'px'
          }"
        >
          <n-thing class="animate__animated animate__fadeIn">
            <template #avatar>
              <n-checkbox
                :checked="selectedMenuItem.includes(element.menuItemId)"
                style="margin-left: -4px; margin-right: 12px"
                @update-checked="onCheckboxChecked($event, element)"
              />
              <n-text class="move-icon">: :</n-text>
            </template>
            <template #header>
              <n-text class="menu-title">{{ element.displayName }}</n-text>
            </template>
            <template #description>
              <n-button
                text
                tag="a"
                :href="element.href"
                target="_blank"
                type="primary"
              >
                {{ element.href }}
              </n-button>
            </template>
            <template #header-extra>
              <n-button-group size="small">
                <n-button tertiary @click="emit('onSettingMenuItem', element)">
                  <template #icon>
                    <n-icon>
                      <SettingIcon />
                    </n-icon>
                  </template>
                  <span v-if="!globalVars.isSmallWindow">设置</span>
                </n-button>
                <n-button tertiary @click="emit('onAddSubMenuItem', element)">
                  <template #icon>
                    <n-icon>
                      <AddIcon />
                    </n-icon>
                  </template>
                  <span v-if="!globalVars.isSmallWindow">添加</span>
                </n-button>
                <n-button
                  tertiary
                  type="error"
                  @click="emit('onDelMenuItem', element)"
                >
                  <template #icon>
                    <n-icon>
                      <TrashIcon />
                    </n-icon>
                  </template>
                  <span v-if="!globalVars.isSmallWindow">删除</span>
                </n-button>
              </n-button-group>
            </template>
          </n-thing>
        </n-list-item>
        <menu-item-list-item
          :menu-items="element.children"
          :menu-item-level="menuItemLevel"
          :selected-menu-item="selectedMenuItem"
          @on-menu-item-moved="emit('onMenuItemMoved', $event)"
          @on-setting-menu-item="emit('onSettingMenuItem', $event)"
          @on-add-sub-menu-item="emit('onAddSubMenuItem', $event)"
          @on-del-menu-item="emit('onDelMenuItem', $event)"
          @on-checked="emit('onChecked', $event)"
          @on-un-checked="emit('onUnChecked', $event)"
        />
      </div>
    </template>
  </draggable>
</template>

<style scoped>
.move-icon {
  cursor: move;
}
</style>
