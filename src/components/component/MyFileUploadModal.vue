<!-- 上传文件模态框 -->
<script setup lang="ts">
// 是否显示模态框
import { onMounted, ref, watch } from 'vue';
import {
  FileStorageDisplayName,
  FileStorageMode
} from '../../models/enum/FileStorageMode.ts';
import { FileGroup } from '../../models/FileGroup.ts';
import { getFileGroups, getStorageModes } from '../../apis/fileApi.ts';
import { errorMsg, successMsg } from '../../utils/Message.ts';
import { StoreKey } from '../../stores/StoreKey.ts';
import { isNumber } from '../../utils/MyUtils.ts';
import {
  NForm,
  NFormItem,
  NModal,
  NSelect,
  SelectOption,
  NUpload,
  NUploadDragger,
  NText,
  NIcon,
  NScrollbar,
  UploadInst,
  UploadFileInfo
} from 'naive-ui';
import { ArchiveOutline as ArchiveIcon } from '@vicons/ionicons5';
import { useUserStore } from '../../stores/UserStore.ts';

const show = defineModel('show', {
  type: Boolean,
  default: false
});

// 实际控制模态框是否显示的变量
const _show = ref(false);

const emit = defineEmits<{
  (e: 'onClose'): void;
}>();

// 用户 Store
const userStore = useUserStore();

// 可用的文件存储策略
const availableStorageModes = ref<FileStorageMode[]>([]);
// 文件存储策略下拉框选项
const storageModeSelectOptions = ref<Array<SelectOption>>([]);
// 当前文件存储策略
const storageModeValue = ref<FileStorageMode | null>(FileStorageMode.LOCAL);

// 所有分组
const fileGroups = ref<FileGroup[]>([]);
// 当前文件分组 ID
const fileGroupValue = ref<number | null>(null);
// 文件分组下拉框选项
const fileGroupSelectOptions = ref<Array<SelectOption>>([]);

// 是否正在加载中
const isLoading = ref(false);

// 上传组件的引用
const uploadRef = ref<UploadInst | null>(null);

// 基地址
const baseUrl = import.meta.env.VITE_BASE_URL;

// 上传组件当前的文件数量
const fileLength = ref(0);

// 当前选择的文件
const currentSelectedFiles = ref<Array<UploadFileInfo>>([]);

onMounted(() => {
  // 监听父组件的 show 属性
  watch(
    () => show.value,
    () => {
      if (show.value) {
        // 显示模态框
        // 获取已配置存储策略和文件组
        refreshStorageMode();
        // 获取分组
        refreshFileGroups();
        // 读取以前的设置
        loadSetting();
        // 显示模态框
        _show.value = true;
      } else {
        // 隐藏模态框
        _show.value = false;
      }
    },
    { immediate: true }
  );
});

/**
 * 读取以前的设置
 * 存储策略、文件组
 */
const loadSetting = () => {
  // 读取文件存储策略，默认本地存储
  storageModeValue.value =
    (localStorage.getItem(
      StoreKey.FILE_UPLOAD_STORAGE_MODE.toString()
    ) as FileStorageMode) ?? FileStorageMode.LOCAL;
  const fileGroupId = localStorage.getItem(StoreKey.FILE_UPLOAD_FILE_GROUP.toString());

  if (fileGroupId && isNumber(fileGroupId)) {
    // 读取的文件组是数字，再判断当前文件组是否还存在
    const fileGroup = fileGroups.value.find(
      (fg) => Number(fileGroupId) === fg.fileGroupId
    );
    if (fileGroup && fileGroup.storageMode === storageModeValue.value) {
      // 文件组存在，并且存储策略匹配，设置当前文件组为选择的文件组
      fileGroupValue.value = fileGroup.fileGroupId;
    }
  }
};

/**
 * 获取已经配置的存储策略
 */
const refreshStorageMode = () => {
  availableStorageModes.value = [];
  storageModeSelectOptions.value = [];
  getStorageModes()
    .then((res) => {
      availableStorageModes.value = res.data as Array<FileStorageMode>;
      // 添加存储策略下拉框选项
      availableStorageModes.value.forEach((storageMode) => {
        storageModeSelectOptions.value.push({
          label: FileStorageDisplayName[storageMode],
          value: storageMode
        });
      });
    })
    .catch((err) => errorMsg(`获取存储策略失败：${err}`));
};

/**
 * 获取文件组
 */
const refreshFileGroups = () => {
  fileGroups.value = [];
  fileGroupValue.value = null;
  fileGroupSelectOptions.value = [];
  getFileGroups(storageModeValue.value)
    .then((res) => {
      fileGroups.value = res.data as Array<FileGroup>;
      // 添加文件组下拉框选项
      fileGroups.value.forEach((fg) => {
        fileGroupSelectOptions.value.push({
          label: fg.displayName,
          value: fg.fileGroupId
        });
      });
    })
    .catch((err) => errorMsg(`获取文件组失败：${err}`));
};

/**
 * 模态框关闭事件
 */
const onClose = () => {
  emit('onClose');
  show.value = false;
  isLoading.value = false;
};

/**
 * 上传文件按钮点击事件
 */
const onSubmit = () => {
  // 判断是否有待上传文件
  let file = currentSelectedFiles.value.find(
    (file) => file.status === 'pending'
  );

  if (!file) {
    errorMsg('你还没有选择任何文件');
    return false;
  }
  isLoading.value = true;
  uploadRef.value?.submit();
  return false;
};

/**
 * 存储策略下拉框选择事件
 */
const onStorageModeSelect = (value: FileStorageMode) => {
  // 根据当前选择的存储策略重新刷新文件组
  if (value) {
    storageModeValue.value = value;
  } else {
    // 清空了存储策略，默认切换到本地存储
    storageModeValue.value = FileStorageMode.LOCAL;
  }
  // 刷新文件组
  refreshFileGroups();
};

/**
 * 文件上传组件选择的文件改变事件
 * @param options
 */
const handleUploadChange = (options: { fileList: UploadFileInfo[] }) => {
  currentSelectedFiles.value = options.fileList;

  fileLength.value = currentSelectedFiles.value.length;
};

/**
 * 文件上传组件上传完成事件
 * @param file
 */
const handleFinish = ({
  event
}: {
  file: UploadFileInfo;
  event?: ProgressEvent;
}) => {
  const response = JSON.parse((event?.target as XMLHttpRequest).response);
  const fileName = response.data.displayName;
  const errMsg = response.errMsg;
  if (response.code === 200) {
    successMsg(`${fileName} 上传成功`);
  } else if (response.code === 409 && errMsg) {
    errorMsg(`${fileName} 上传失败：${errMsg}`);
  } else {
    errMsg('未知错误，请查看服务端日志');
  }
  isLoading.value = false;
  return undefined;
};
</script>

<template>
  <!-- 上传文件模态框 -->
  <n-modal
    v-model:show="_show"
    preset="dialog"
    title="上传附件"
    :positive-text="isLoading ? '正在上传' : '上传'"
    negative-text="取消"
    :loading="isLoading"
    @maskClick="onClose"
    @close="onClose"
    @positiveClick="onSubmit"
    @negativeClick="onClose"
    @keydown.enter="onSubmit"
  >
    <template #default>
      <n-scrollbar style="max-height: 70vh; padding-right: 12px">
        <n-form class="dialog-form" style="margin: 10px 5px">
          <n-form-item label="存储策略">
            <n-select
              :options="storageModeSelectOptions"
              :value="storageModeValue"
              @update:value="onStorageModeSelect"
              clearable
            />
          </n-form-item>
          <n-form-item label="文件组">
            <n-select
              :options="fileGroupSelectOptions"
              v-model:value="fileGroupValue"
              placeholder="文件组，留空为默认分组（根目录）"
              clearable
            />
          </n-form-item>

          <n-form-item label="选择附件">
            <n-upload
              ref="uploadRef"
              multiple
              directory-dnd
              :default-upload="false"
              :action="baseUrl + '/admin/file'"
              :headers="{
                Authorization: `Bearer ${userStore.token}`
              }"
              :data="{
                storageMode: storageModeValue ?? '',
                fileGroupId: (fileGroupValue ?? '').toString()
              }"
              @change="handleUploadChange"
              @finish="handleFinish"
            >
              <n-upload-dragger>
                <div style="margin-bottom: 12px">
                  <n-icon size="48" :depth="3">
                    <ArchiveIcon />
                  </n-icon>
                </div>
                <n-text style="font-size: 16px">
                  点击或者拖动文件到该区域来上传
                </n-text>
              </n-upload-dragger>
            </n-upload>
          </n-form-item>
        </n-form>
      </n-scrollbar>
    </template>
  </n-modal>
</template>

<style scoped></style>
