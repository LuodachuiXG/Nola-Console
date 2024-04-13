<!-- 选择文件模态框 -->
<script setup lang="ts">
import { NModal, NButton, NSpace, NCard } from 'naive-ui';
import { MFile } from '../../models/MFile.ts';
import MyFileCard from './MyFileCard.vue';
import { ref } from 'vue';
import { errorMsg } from '../../utils/Message.ts';

interface Props {
  // 文件是否支持多选（默认 true）
  multiple?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  multiple: true
});

// 显示模态框
const show = defineModel('show', {
  type: Boolean,
  default: false,
  required: true
});

const emit = defineEmits<{
  (e: 'onConfirm', files: Array<MFile>): void;
}>();

// 选择的文件
const selectedFiles = ref<Array<MFile>>([]);

/**
 * 文件选择事件
 * @param files
 */
const onFileSelected = (files: Array<MFile>) => {
  selectedFiles.value = files;
};

/**
 * 确定按钮点击事件
 */
const onConfirmClick = () => {
  if (selectedFiles.value.length === 0) {
    errorMsg('你还没有选择任何文件');
  } else {
    emit('onConfirm', selectedFiles.value);
    show.value = false;
  }
};
</script>

<template>
  <n-modal v-model:show="show" style="margin: 50px">
    <template #default>
      <n-card
        content-style="padding: 0;"
        :bordered="false"
        footer-style="padding: 0;"
      >
        <template #default>
          <my-file-card
            @on-file-selected="onFileSelected"
            :multiple="multiple"
          />
        </template>
        <template #footer>
          <div style="margin: 10px; display: flex; justify-content: end">
            <n-space>
              <n-button @click="show = false">取消</n-button>
              <n-button type="primary" @click="onConfirmClick">确定</n-button>
            </n-space>
          </div>
        </template>
      </n-card>
    </template>
  </n-modal>
</template>

<style scoped></style>
