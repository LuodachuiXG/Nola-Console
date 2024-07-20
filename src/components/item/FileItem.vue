<!-- 文件项组件 -->
<script setup lang="ts">
import { MFile } from '../../models/MFile.ts';
import {
  NCard,
  NImage,
  NEllipsis,
  NCheckbox,
  NIcon,
  NText,
  NSpace
} from 'naive-ui';
import { onMounted, ref } from 'vue';
import { isImage } from '../../utils/MyUtils.ts';
import { DocumentOutline as FileIcon } from '@vicons/ionicons5';
import { getRealUrl } from '../../utils/NetworkUtil.ts';

interface Props {
  file: MFile;
  showCheckbox?: boolean;
  isChecked?: boolean
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'onCheckboxChange', value: boolean, fileId: number): void;
  (e: 'onTitleClick', file: MFile): void;
  (e: 'onChecked', file: MFile): void;
  (e: 'onUnChecked', file: MFile): void;
}>();

// 当前文件的扩展名
const currentFileExtension = ref('');

onMounted(() => {
  const ex = props.file.displayName.split('.').pop();
  if (ex) {
    currentFileExtension.value = ex.toUpperCase();
  } else {
    currentFileExtension.value = '未知类型';
  }
});

/**
 * 复选框改变事件
 * @param value
 */
const onCheckBoxChange = (value: boolean) => {
  if (value) {
    emit('onChecked', props.file);
  } else {
    emit('onUnChecked', props.file);
  }
};

/**
 * 标题点击事件
 */
const onTitleClick = () => {
  emit('onTitleClick', props.file);
};
</script>

<template>
  <n-card class="file-card" header-style="padding:0;margin:0;">
    <template #cover>
      <n-image
        class="img"
        v-if="isImage(file.displayName)"
        object-fit="cover"
        :src="getRealUrl(file.url)"
        :alt="file.displayName"
        lazy
      />
      <div v-else class="img file-div">
        <n-space vertical>
          <n-icon size="42">
            <FileIcon />
          </n-icon>
          <div style="text-align: center; margin-top: -10px">
            <n-text>{{ currentFileExtension }}</n-text>
          </div>
        </n-space>
      </div>
    </template>
    <template #header>
      <div class="header">
        <n-checkbox
          v-if="showCheckbox"
          @update:checked="onCheckBoxChange"
          :checked="isChecked"
        />
        <div
          class="pointer"
          style="display: inline"
          @click="onTitleClick"
          :style="{
            marginLeft: showCheckbox ? '5px' : '0px'
          }"
        >
          <n-ellipsis
            :style="{
              width: showCheckbox ? '83%' : '100%'
            }"
          >
            {{ file.displayName }}
          </n-ellipsis>
        </div>
      </div>
    </template>
  </n-card>
</template>

<style scoped>
.file-card {
  width: 150px;
  height: 150px;

  .img {
    height: 120px;
    width: 100%;
  }

  .header {
    margin: 10px;
    height: 14px;
    line-height: 16px;
    font-size: 0.8em;
  }

  .file-div {
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
