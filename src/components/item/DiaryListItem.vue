<!-- 日常列表项 -->
<script setup lang="ts">
import {
  NButton,
  NButtonGroup,
  NIcon,
  NListItem,
  NThing,
  NText,
  NCheckbox
} from 'naive-ui';
import {
  TrashOutline as TrashIcon,
  BrushOutline as EditIcon
} from '@vicons/ionicons5';
import { inject } from 'vue';
import { formatTimestamp } from '../../utils/MyUtils.ts';
import { Diary } from '../../models/Diary.ts';

interface Props {
  /** 日常接口 **/
  diary: Diary;
  /** 是否选中 **/
  isChecked: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'onEditDiary', diary: Diary): void;
  (e: 'onDeleteDiary', diary: Diary): void;
  // 选择框选中事件
  (e: 'onChecked', diary: Diary): void;
  // 选择框取消选中事件
  (e: 'onUnChecked', diary: Diary): void;
}>();

// 全局响应式变量
const globalVars: GlobalVars = inject('globalVars')!!;

/**
 * 编辑日常点击事件
 * @param diary 日常接口
 */
const onEditDiary = (diary: Diary) => {
  emit('onEditDiary', diary);
};

/**
 * 删除日常事件
 * @param diary 日常接口
 */
const onDeleteDiary = (diary: Diary) => {
  emit('onDeleteDiary', diary);
};

/**
 * 选择框选中事件
 * @param checked
 */
const onCheckboxChecked = (checked: boolean) => {
  if (checked) {
    emit('onChecked', props.diary);
  } else {
    emit('onUnChecked', props.diary);
  }
};
</script>

<template>
  <n-list-item>
    <n-thing class="animate__animated animate__fadeIn">
      <template #avatar>
        <n-checkbox
          :checked="isChecked"
          style="margin-left: -4px;"
          @update-checked="onCheckboxChecked"
        />
      </template>
      <template #header>
        {{ formatTimestamp(diary.createTime) }}
      </template>
      <template #description>
        <n-text depth="2">{{ diary.content }}</n-text>
      </template>
      <template #header-extra>
        <n-button-group size="small">
          <n-button type="default" tertiary @click="onEditDiary(diary)">
            <template #icon>
              <n-icon>
                <EditIcon />
              </n-icon>
            </template>
            <span v-if="!globalVars.isSmallWindow">编辑</span>
          </n-button>
          <n-button type="error" tertiary @click="onDeleteDiary(diary)">
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
.time-div {
  display: flex;
  justify-content: end;
}
</style>
