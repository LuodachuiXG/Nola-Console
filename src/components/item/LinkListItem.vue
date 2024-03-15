<!-- 链接列表项 -->
<script setup lang="ts">
import {
  NButton,
  NButtonGroup,
  NIcon,
  NListItem,
  NThing,
  NAvatar,
  NText,
  NSpace,
  NRow,
  NCol,
  NPopover,
  NBadge,
  NCheckbox
} from 'naive-ui';
import {
  TrashOutline as TrashIcon,
  SettingsOutline as SettingIcon
} from '@vicons/ionicons5';
import { inject, ref } from 'vue';
import { Link } from '../../models/Link.ts';
import { formatTimestamp } from '../../utils/MyUtils.ts';

interface Props {
  /** 链接接口 **/
  link: Link;
  /** 是否选中 **/
  isChecked: boolean
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'onSettingLink', link: Link): void;
  (e: 'onDeleteLink', link: Link): void;
  // 选择框选中事件
  (e: 'onChecked', link: Link): void;
  // 选择框取消选中事件
  (e: 'onUnChecked', link: Link): void;
}>();

// 全局响应式变量
const globalVars: GlobalVars = inject('globalVars')!!;

// 鼠标是否进入头像
const isMouseEnterAvatar = ref(false);

/**
 * 设置链接事件
 * @param link 链接
 */
const onSettingLink = (link: Link) => {
  emit('onSettingLink', link);
};

/**
 * 删除链接事件
 * @param link 链接
 */
const onDeleteLink = (link: Link) => {
  emit('onDeleteLink', link);
};

/**
 * 鼠标进入头像事件
 */
const onAvatarEnter = () => {
  if (isMouseEnterAvatar.value) return;
  isMouseEnterAvatar.value = true;
  setTimeout(() => {
    isMouseEnterAvatar.value = false;
  }, 500);
};

/**
 * 选择框选中事件
 * @param checked
 */
const onCheckboxChecked = (checked: boolean) => {
  if (checked) {
    emit('onChecked', props.link);
  } else {
    emit('onUnChecked', props.link);
  }
};
</script>

<template>
  <n-list-item>
    <n-thing class="animate__animated animate__fadeIn">
      <template #avatar>
        <n-checkbox
          :checked="isChecked"
          style="margin-left: -4px; margin-right: 12px"
          @update-checked="onCheckboxChecked"
        />
        <n-badge
          :value="link.priority"
          class="animate__animated none-select"
          :class="{ animate__pulse: isMouseEnterAvatar }"
          style="margin-right: 5px"
        >
          <div @mouseenter="onAvatarEnter">
            <n-avatar
              class="shadow"
              v-if="link.logo !== null"
              :src="link.logo"
              circle
              size="large"
            >
              <template #fallback>
                <div
                  class="avatar-text-div shadow"
                  :class="{ animate__pulse: isMouseEnterAvatar }"
                >
                  <span>{{ link.displayName[0] }}</span>
                </div>
              </template>
            </n-avatar>
            <div
              v-else
              class="avatar-text-div shadow"
              :class="{ animate__pulse: isMouseEnterAvatar }"
            >
              <span>{{ link.displayName[0] }}</span>
            </div>
          </div>
        </n-badge>
      </template>
      <template #header>
        <n-popover trigger="hover">
          <template #trigger>
            <n-text strong style="cursor: default"
              >{{ link.displayName }}
            </n-text>
          </template>
          <span>备注：{{ link.remark ?? '无' }}</span>
        </n-popover>
      </template>
      <template #description>
        <n-row>
          <n-col :span="globalVars.isSmallWindow ? 24 : 18">
            <n-space vertical size="small" style="margin-top: -8px">
              <n-button
                text
                tag="a"
                :href="link.url"
                target="_blank"
                type="primary"
              >
                {{ link.url }}
              </n-button>
              <n-text depth="3">{{ link.description }}</n-text>
            </n-space>
          </n-col>
          <n-col :span="6" v-if="!globalVars.isSmallWindow">
            <div class="link-time-div">
              <n-text
                class="link-time-div-text"
                depth="3"
                style="font-size: 0.9em"
                >{{ formatTimestamp(link.createTime) }}
              </n-text>
            </div>
          </n-col>
        </n-row>
      </template>
      <template #header-extra>
        <n-button-group size="small">
          <n-button type="default" tertiary @click="onSettingLink(link)">
            <template #icon>
              <n-icon>
                <SettingIcon />
              </n-icon>
            </template>
            <span v-if="!globalVars.isSmallWindow">设置</span>
          </n-button>
          <n-button type="error" tertiary @click="onDeleteLink(link)">
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
</template>
<style scoped>
.avatar-text-div {
  background-color: var(--color-primary);
  color: white;
  line-height: 38px;
  height: 38px;
  width: 38px;
  text-align: center;
  border-radius: 9999px;
  user-select: none;
}

.link-time-div {
  position: relative;
  height: 100%;
}

.link-time-div-text {
  position: absolute;
  bottom: 0;
  right: 0;
}
</style>
