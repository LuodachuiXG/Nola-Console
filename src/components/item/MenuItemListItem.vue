<script setup lang="ts">
import {
  NButton,
  NListItem,
  NText,
  NThing,
  NButtonGroup,
  NIcon
} from 'naive-ui';
import { MenuItem } from '../../models/MenuItem.ts';
import {
  ArrowBackOutline as LeftArrowIcon,
  ArrowForwardOutline as RightArrowIcon
} from '@vicons/ionicons5';

import draggable from 'vuedraggable';

interface Props {
  menuItemLevel: Map<number, number>;
}

const emit = defineEmits<{
  (e: 'onMenuItemMoved', menuItem: MenuItem): void;
}>();

defineProps<Props>();

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
                <n-button tertiary :disabled="element.parentMenuItemId === null">
                  <template #icon>
                    <n-icon>
                      <LeftArrowIcon />
                    </n-icon>
                  </template>
                </n-button>
                <n-button tertiary>
                  <template #icon>
                    <n-icon>
                      <RightArrowIcon />
                    </n-icon>
                  </template>
                </n-button>
              </n-button-group>
            </template>
          </n-thing>
        </n-list-item>
        <menu-item-list-item
          :menu-items="element.children"
          :menu-item-level="menuItemLevel"
          @on-menu-item-moved="emit('onMenuItemMoved', $event)"
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
