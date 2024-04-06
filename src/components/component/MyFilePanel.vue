<!-- 文件面板组件 -->
<script setup lang="ts">
import {
  NSpace,
  NSelect,
  SelectOption,
  NInputGroup,
  NIcon,
  NButton,
  NResult,
  NInput
} from 'naive-ui';
import { onMounted, ref } from 'vue';
import {
  MenuOutline as MenuIcon,
  CloudUploadOutline as UploadIcon,
  SearchOutline as SearchIcon
} from '@vicons/ionicons5';
import {
  FileStorageDisplayName,
  FileStorageMode
} from '../../models/enum/FileStorageMode.ts';
import {
  getFileGroups,
  getFiles,
  getStorageModes
} from '../../apis/fileApi.ts';
import { errorMsg } from '../../utils/Message.ts';
import { FileGroup } from '../../models/FileGroup.ts';
import { MFile } from '../../models/MFile.ts';
import { FileSort } from '../../models/enum/FileSort.ts';
import { Pager } from '../../models/Pager.ts';
import FileItem from '../item/FileItem.vue';

// 当前页
const currentPage = ref(1);
// 每页条数
const pageSize = ref(20);
// 总文件数
const totalFiles = ref(0);
// 总页数
const totalPages = ref(0);

// 存储策略下拉框选项
const storageModeSelectOptions = ref<Array<SelectOption>>([]);
// 存储策略下拉框值
const storageModeValue = ref<FileStorageMode | null>(null);

// 文件分组下拉框选项
const fileGroupSelectOptions = ref<Array<SelectOption>>([]);
// 文件分组下拉框值
const fileGroupValue = ref<number | null>(null);
// 当前选择的存储策略的文件分组
const fileGroups = ref<Array<FileGroup>>([]);

// 文件列表
const files = ref<Array<MFile>>([]);

// 附件查询排序方式，默认按照创建时间降序
const fileSort = ref<FileSort | null>(FileSort.CREATE_TIME_DESC);

// 文件检索关键字
const fileKey = ref('');

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
  // 获取所有文件
  refreshFiles();
  // 获取所有已经启用的存储策略
  refreshFileStorageMode();
});

/**
 * 刷新文件列表
 */
const refreshFiles = () => {
  window.$loadingBar.start();
  getFiles(
    currentPage.value,
    pageSize.value,
    fileSort.value,
    storageModeValue.value,
    fileKey.value
  )
    .then((res) => {
      window.$loadingBar.finish();
      const pager = res.data as Pager<MFile>;
      currentPage.value = pager.page;
      pageSize.value = pager.size;
      totalFiles.value = pager.totalData;
      totalPages.value = pager.totalPages;
      files.value = pager.data;
      console.log(files.value);
    })
    .catch((err) => {
      window.$loadingBar.error();
      errorMsg(err);
    });
};

/**
 * 获取所有已经启用的存储策略
 */
const refreshFileStorageMode = () => {
  getStorageModes()
    .then((res) => {
      // 获取所有存储策略成功，获取当前存储策略的文件分组
      refreshFileGroups();
      const storageModes = res.data as Array<FileStorageMode>;
      storageModes.forEach((sm) => {
        storageModeSelectOptions.value.push({
          label: FileStorageDisplayName[sm],
          value: sm
        });
      });
    })
    .catch((err) => errorMsg(err));
};

/**
 * 获取所有文件分组
 */
const refreshFileGroups = () => {
  // 清空文件分组下拉框选项和文件分组数组
  fileGroups.value = [];
  fileGroupSelectOptions.value = [];
  fileGroupValue.value = null;
  getFileGroups(storageModeValue.value)
    .then((res) => {
      fileGroups.value = res.data;
      fileGroups.value.forEach((fg) => {
        let label = fg.displayName;
        if (!storageModeValue.value) {
          // 如果当前是获取所有文件分组，则显示存储策略名称
          label += `（${FileStorageDisplayName[fg.storageMode]}）`;
        }
        fileGroupSelectOptions.value.push({
          label: label,
          value: fg.fileGroupId
        });
      });
    })
    .catch((err) => errorMsg(err));
};

/**
 * 存储策略下拉框值改变事件
 */
const onStorageModeSelectChange = () => {
  // 获取文件
  refreshFiles();
  // 重新获取当前存储策略的文件分组
  refreshFileGroups();
};

/**
 * 文件分组下拉框值改变事件
 */
const onFileGroupSelectChange = () => {
  // 获取文件
  refreshFiles();
};

/**
 * 文件关键字检索输入框清空事件
 */
const onFileKeyClear = () => {
  fileKey.value = '';
  refreshFiles();
};
</script>

<template>
  <div class="container">
    <!-- 工具栏 -->
    <div class="toolbar">
      <n-space>
        <n-input-group>
          <n-select
            style="width: 150px"
            :options="storageModeSelectOptions"
            v-model:value="storageModeValue"
            placeholder="全部存储策略"
            @update:value="onStorageModeSelectChange"
            clearable
          />
          <n-button>
            <template #icon>
              <n-icon>
                <MenuIcon />
              </n-icon>
            </template>
          </n-button>
        </n-input-group>

        <n-input-group>
          <n-select
            style="width: 250px"
            :options="fileGroupSelectOptions"
            v-model:value="fileGroupValue"
            placeholder="全部分组"
            @update:value="onFileGroupSelectChange"
            clearable
          />
          <n-button>
            <template #icon>
              <n-icon>
                <MenuIcon />
              </n-icon>
            </template>
          </n-button>
        </n-input-group>

        <n-input-group>
          <n-input
            placeholder="关键字"
            v-model:value="fileKey"
            clearable
            @clear="onFileKeyClear"
          />
          <n-button @click="refreshFiles">
            <template #icon>
              <n-icon>
                <SearchIcon />
              </n-icon>
            </template>
          </n-button>
        </n-input-group>

        <n-select
          :options="fileSortSelectOptions"
          v-model:value="fileSort"
          @update:value="refreshFiles"
          placeholder="排序方式"
          style="width: 130px"
        />
      </n-space>
    </div>
    <div class="content">
      <n-result
        style="margin: 40px 0"
        status="500"
        title="这里什么都没有"
        v-if="files.length === 0"
      >
        <template #footer>
          <n-button>
            <template #icon>
              <n-icon>
                <UploadIcon />
              </n-icon>
            </template>
            上传附件
          </n-button>
        </template>
      </n-result>

      <div v-else style="margin-top: 10px">
        <n-space>
          <file-item
            v-for="(file, index) in files"
            :file="file"
            :key="index"
            show-checkbox
          />
        </n-space>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  padding: 10px;
}
</style>
