<!-- 访问日志列表项 -->
<script setup lang="ts">
import {
  NButton,
  NCheckbox,
  NIcon,
  NListItem,
  NSpace,
  NTag,
  NText,
  NThing
} from 'naive-ui';
import { TrashOutline as TrashIcon } from '@vicons/ionicons5';
import { AccessLog } from '../../models/AccessLog.ts';
import {
  AccessLogType,
  AccessLogTypeDisplayName
} from '../../models/enum/AccessLogType.ts';
import { formatTimestamp } from '../../utils/MyUtils.ts';
import { useGlobalStore } from '../../stores/GlobalStore.ts';

interface Props {
  /** 访问日志 **/
  accessLog: AccessLog;
  /** 是否选中 **/
  isChecked: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'onDelete', accessLog: AccessLog): void;
  (e: 'onChecked', accessLog: AccessLog): void;
  (e: 'onUnChecked', accessLog: AccessLog): void;
}>();

const globalStore = useGlobalStore();

/**
 * 获取访问日志类型标签颜色
 * @param type 访问日志类型
 */
const getTypeTagType = (
  type: AccessLogType
): 'default' | 'info' | 'success' => {
  switch (type) {
    case AccessLogType.BLOG:
      return 'info';
    case AccessLogType.POST:
      return 'success';
    default:
      return 'default';
  }
};

/**
 * 选择框改变事件
 * @param checked 是否选中
 */
const onCheckboxChecked = (checked: boolean) => {
  if (checked) {
    emit('onChecked', props.accessLog);
  } else {
    emit('onUnChecked', props.accessLog);
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
      </template>
      <template #header>
        <n-space align="center" :size="6" style="flex-wrap: wrap">
          <n-tag size="small" round :type="getTypeTagType(accessLog.type)">
            {{ AccessLogTypeDisplayName[accessLog.type] }}
          </n-tag>
          <n-text strong style="word-break: break-all">
            {{ accessLog.path }}
          </n-text>
          <n-text depth="3" style="font-size: 0.85em">
            来自 {{ accessLog.ip }}
          </n-text>
          <n-text depth="3" style="font-size: 0.85em">
            {{ formatTimestamp(accessLog.accessTime) }}
          </n-text>
        </n-space>
      </template>
      <template #description>
        <n-text depth="2" style="white-space: pre-wrap; word-break: break-word">
          {{ accessLog.message ?? '无附加信息' }}
        </n-text>
      </template>
      <template #header-extra>
        <n-button tertiary type="error" size="small" @click="emit('onDelete', accessLog)">
          <template #icon>
            <n-icon>
              <TrashIcon />
            </n-icon>
          </template>
          <span v-if="!globalStore.isSmallWindow">删除</span>
        </n-button>
      </template>
    </n-thing>
  </n-list-item>
</template>

<style scoped></style>
