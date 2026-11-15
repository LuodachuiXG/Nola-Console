<!-- 操作记录列表项 -->
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
import { Operation } from '../../models/Operation.ts';
import {
  OperationType,
  OperationTypeDisplayName
} from '../../models/enum/OperationType.ts';
import { formatTimestamp } from '../../utils/MyUtils.ts';
import { useGlobalStore } from '../../stores/GlobalStore.ts';

interface Props {
  /** 操作记录 **/
  operation: Operation;
  /** 是否选中 **/
  isChecked: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'onDelete', operation: Operation): void;
  (e: 'onChecked', operation: Operation): void;
  (e: 'onUnChecked', operation: Operation): void;
}>();

const globalStore = useGlobalStore();

/**
 * 选择框改变事件
 * @param checked 是否选中
 */
const onCheckboxChecked = (checked: boolean) => {
  if (checked) {
    emit('onChecked', props.operation);
  } else {
    emit('onUnChecked', props.operation);
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
          <n-text strong>{{ operation.username }}</n-text>
          <n-tag
            size="small"
            round
            :type="
              operation.operationType === OperationType.HIGH_RISK
                ? 'error'
                : 'default'
            "
          >
            {{ OperationTypeDisplayName[operation.operationType] }}
          </n-tag>
          <n-text depth="3" style="font-size: 0.85em">
            {{ formatTimestamp(operation.createTime) }}
          </n-text>
        </n-space>
      </template>
      <template #description>
        <n-text depth="2" style="white-space: pre-wrap; word-break: break-word">
          {{ operation.operationDesc ?? '无描述' }}
        </n-text>
      </template>
      <template #header-extra>
        <n-button tertiary type="error" size="small" @click="emit('onDelete', operation)">
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
