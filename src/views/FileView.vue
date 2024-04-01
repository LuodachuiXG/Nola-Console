<script setup lang="ts">
import MyCard from '../components/component/MyCard.vue';
import { NButton, NIcon, NSelect, NSpace } from 'naive-ui';
import {
  AppsOutline as BlockIcon,
  CloudUploadOutline as UploadIcon,
  ListOutline as ListIcon
} from '@vicons/ionicons5';
import { inject, onMounted, ref } from 'vue';
import { StoreEnum } from '../models/enum/StoreEnum.ts';
import { FileSort } from '../models/enum/FileSort.ts';
import MyFile from '../components/component/MyFile.vue';

// 标记当前附件显示模式的枚举类
enum FileMode {
  // 列表模式
  LIST,
  // 块模式
  BLOCK
}

const globalVars: GlobalVars = inject('globalVars')!!;

// 当前附件显示模式
const currentFileMode = ref<FileMode>(FileMode.BLOCK);

// 附件查询排序方式，默认按照创建时间降序
const fileSort = ref<FileSort | null>(
  FileSort.CREATE_TIME_DESC
);
// 附件排序下拉框选项
const fileSortSelectOptions = [
  {
    label: '创建时间降序',
    value: FileSort.CREATE_TIME_DESC
  },
  {
    label: '创建时间升序',
    value: FileSort.CREATE_TIME_ASC
  },
  {
    label: '附件大小降序',
    value: FileSort.SIZE_DESC
  },
  {
    label: '附件大小升序',
    value: FileSort.SIZE_ASC
  }
];

onMounted(() => {
  // 读取设置
  loadSetting();
  // 刷新附件
  refreshFiles();
});

/**
 * 读取设置
 */
const loadSetting = () => {
  // 读取以前是否设置过附件显示模式
  currentFileMode.value = Number(
    localStorage.getItem(StoreEnum.ATTACHMENT_MODE) ?? FileMode.BLOCK
  );
};

/**
 * 刷新附件
 */
const refreshFiles = () => {};

/**
 * 附件显示模式改变事件
 * @param mode 标签模式
 */
const onTagModeChange = (mode: FileMode) => {
  currentFileMode.value = mode;
  // 刷新附件
  refreshFiles();
  // 将标签模式存储
  localStorage.setItem(StoreEnum.ATTACHMENT_MODE, mode.toString());
};

/**
 * 上传附件按钮点击事件
 */
const onUploadClick = () => {};
</script>

<template>
  <div class="container">
    <my-card item-string="附件">
      <template #header-extra>
        <n-space>
          <n-select
            :options="fileSortSelectOptions"
            v-model:value="fileSort"
            @update:value="refreshFiles"
            placeholder="排序方式"
            style="width: 130px"
          />
          <n-button type="primary" @click="onUploadClick">
            <template #icon>
              <n-icon>
                <UploadIcon />
              </n-icon>
            </template>
            <span v-if="!globalVars.isSmallWindow">上传附件</span>
          </n-button>
        </n-space>
      </template>
      <template #content>
        <my-file>

        </my-file>
      </template>

      <template #action-left>
        <n-space>
          <n-button
            circle
            size="small"
            :secondary="currentFileMode === FileMode.BLOCK"
            @click="onTagModeChange(FileMode.BLOCK)"
          >
            <template #icon>
              <BlockIcon />
            </template>
          </n-button>
          <n-button
            circle
            size="small"
            :secondary="currentFileMode === FileMode.LIST"
            @click="onTagModeChange(FileMode.LIST)"
          >
            <template #icon>
              <ListIcon />
            </template>
          </n-button>
        </n-space>
      </template>
    </my-card>
  </div>
</template>

<style scoped></style>
