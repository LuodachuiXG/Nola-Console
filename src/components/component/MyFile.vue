<!-- 附件组件 -->
<script setup lang="ts">
import {
  NSpace,
  NSelect,
  SelectOption,
  NInputGroup,
  NIcon,
  NButton,
  NResult
} from 'naive-ui';
import { onMounted, ref } from 'vue';
import {
  MenuOutline as MenuIcon,
  CloudUploadOutline as UploadIcon
} from '@vicons/ionicons5';
import {
  FileStorageDisplayName,
  FileStorageMode
} from '../../models/enum/FileStorageMode.ts';
import { getFileGroups, getStorageModes } from '../../apis/fileApi.ts';
import { errorMsg } from '../../utils/Message.ts';
import { FileGroup } from '../../models/FileGroup.ts';
import { MFile } from '../../models/MFile.ts';

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

onMounted(() => {
  // 获取所有已经启用的存储策略
  refreshFileStorageMode();
});

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
          label += `（${FileStorageDisplayName[fg.storageMode]}）`
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
  // 重新获取当前存储策略的文件分组
  refreshFileGroups();
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
      </n-space>
    </div>
    <div class="content">
      <n-result style="margin: 40px 0" status="500" title="这里什么都没有">
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
    </div>
  </div>
</template>

<style scoped>
.container {
  padding: 10px;
}
</style>
