<!-- 文件项组件 -->
<script setup lang="ts">
import { MFile } from '../../models/MFile.ts';
import { NCard, NImage, NEllipsis, NCheckbox } from 'naive-ui';
import { onMounted } from 'vue';

interface Props {
  file: MFile;
  showCheckbox?: boolean;
}

// 图片基地址
const imgBaseUrl = import.meta.env.VITE_IMG_BASE_URL;

const props = defineProps<Props>();

// 复选框是否选中
const checked = defineModel('checked', {
  type: Boolean,
  default: false
});

const emit = defineEmits<{
  (e: 'onCheckboxChange', value: boolean, fileId: number): void;
  (e: 'onTitleClick', file: MFile): void;
}>();

onMounted(() => {});

/**
 * 复选框改变事件
 * @param value
 */
const onCheckBoxChange = (value: boolean) => {
  emit('onCheckboxChange', value, props.file.fileId);
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
        :class="{ dark: checked }"
        class="img"
        object-fit="cover"
        :src="file.url.includes('http') ? file.url : imgBaseUrl + file.url"
        :alt="file.displayName"
      />
    </template>
    <template #header>
      <div class="header">
        <n-checkbox
          v-if="showCheckbox"
          @update:checked="onCheckBoxChange"
          v-model:checked="checked"
        />
        <n-ellipsis
          class="pointer"
          @click="onTitleClick"
          :style="{
            marginLeft: showCheckbox ? '5px' : '0px',
            width: showCheckbox ? '83%' : '100%'
          }"
        >
          {{ file.displayName }}
        </n-ellipsis>
      </div>
    </template>
  </n-card>
</template>

<style scoped>
.file-card {
  width: 150px;
  height: 150px;

  .img {
    height: 130px;
    width: 100%;
  }

  .header {
    margin: 10px;
    height: 14px;
    line-height: 16px;
    font-size: 0.8em;
  }
}

.dark {
  filter: brightness(0.6);
}
</style>
