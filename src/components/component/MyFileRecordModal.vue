<!-- 登记文件记录模态框 -->
<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
import {
  NButton,
  NForm,
  NFormItem,
  NIcon,
  NInput,
  NInputNumber,
  NModal,
  NSelect,
  NText,
  FormInst,
  SelectOption
} from 'naive-ui';
import { DocumentOutline as FileIcon } from '@vicons/ionicons5';
import {
  FileStorageDisplayName,
  FileStorageMode
} from '../../models/enum/FileStorageMode.ts';
import { FileGroup } from '../../models/FileGroup.ts';
import { addFileRecord, getFileGroups, getStorageModes } from '../../apis/fileApi.ts';
import { successMsg } from '../../utils/Message.ts';
import { formatFileSize } from '../../utils/MyUtils.ts';
import { StoreKey } from '../../stores/StoreKey.ts';

const show = defineModel('show', {
  type: Boolean,
  default: false
});

const emit = defineEmits<{
  (e: 'onSaved'): void;
}>();

// 实际控制模态框是否显示的变量
const _show = ref(false);

// 表单引用
const formRef = ref<FormInst | null>(null);
// 是否加载中
const isLoading = ref(false);

// 存储策略下拉框选项
const storageModeOptions = ref<Array<SelectOption>>([]);
// 文件分组下拉框选项
const fileGroupOptions = ref<Array<SelectOption>>([]);

// 本地文件选择框引用
const localFileInput = ref<HTMLInputElement | null>(null);

// 表单
const form = reactive<{
  name: string;
  size: number | null;
  storageMode: FileStorageMode;
  fileGroupId: number | null;
}>({
  name: '',
  size: null,
  storageMode: FileStorageMode.LOCAL,
  fileGroupId: null
});

onMounted(() => {
  watch(
    () => show.value,
    () => {
      if (show.value) {
        clearForm();
        refreshStorageModes();
        loadSettings();
        _show.value = true;
      } else {
        _show.value = false;
      }
    },
    { immediate: true }
  );
});

/**
 * 读取上次使用的存储策略和文件组
 */
const loadSettings = () => {
  const mode = localStorage.getItem(
    StoreKey.FILE_UPLOAD_STORAGE_MODE.toString()
  ) as FileStorageMode | null;
  form.storageMode = mode ?? FileStorageMode.LOCAL;
  refreshFileGroups();
};

/**
 * 获取已配置的存储策略
 */
const refreshStorageModes = () => {
  getStorageModes()
    .then((res) => {
      const modes = res.data as Array<FileStorageMode>;
      storageModeOptions.value = modes.map((mode) => {
        return {
          label: FileStorageDisplayName[mode],
          value: mode
        };
      });
      if (modes.length > 0 && !modes.includes(form.storageMode)) {
        form.storageMode = modes[0];
        refreshFileGroups();
      }
    })
    .catch(() => {});
};

/**
 * 获取当前存储策略的文件组
 */
const refreshFileGroups = () => {
  form.fileGroupId = null;
  fileGroupOptions.value = [];
  getFileGroups(form.storageMode)
    .then((res) => {
      const groups = res.data as Array<FileGroup>;
      fileGroupOptions.value = groups.map((group) => {
        return {
          label: group.displayName,
          value: group.fileGroupId
        };
      });
      const lastGroupId = Number(
        localStorage.getItem(StoreKey.FILE_UPLOAD_FILE_GROUP.toString())
      );
      if (!isNaN(lastGroupId)) {
        const group = groups.find((item) => item.fileGroupId === lastGroupId);
        if (group) {
          form.fileGroupId = group.fileGroupId;
        }
      }
    })
    .catch(() => {});
};

/**
 * 存储策略改变事件
 */
const onStorageModeChange = () => {
  refreshFileGroups();
};

/**
 * 清空表单
 */
const clearForm = () => {
  form.name = '';
  form.size = null;
  form.fileGroupId = null;
};

/**
 * 关闭模态框
 */
const onClose = () => {
  _show.value = false;
  show.value = false;
};

/**
 * 选择本地文件，仅读取名称和大小，不上传文件内容
 */
const onChooseLocalFile = () => {
  localFileInput.value?.click();
};

/**
 * 本地文件选择事件
 * @param event 选择事件
 */
const onLocalFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';
  if (!file) {
    return;
  }
  form.name = file.name;
  form.size = file.size;
};

/**
 * 提交登记
 */
const onSubmit = () => {
  formRef.value
    ?.validate((errors) => {
      if (!errors) {
        isLoading.value = true;
        addFileRecord(
          form.name,
          form.size ?? 0,
          form.storageMode,
          form.fileGroupId
        )
          .then(() => {
            isLoading.value = false;
            successMsg('登记成功');
            emit('onSaved');
            onClose();
          })
          .catch(() => {
            isLoading.value = false;
          });
      }
    })
    .catch(() => {});
  return false;
};
</script>

<template>
  <n-modal
    v-model:show="_show"
    preset="dialog"
    title="登记文件记录"
    :positive-text="isLoading ? '正在登记' : '登记'"
    negative-text="取消"
    :loading="isLoading"
    @mask-click="onClose"
    @close="onClose"
    @positive-click="onSubmit"
    @negative-click="onClose"
  >
    <template #default>
      <input
        ref="localFileInput"
        type="file"
        style="display: none"
        @change="onLocalFileChange"
      />
      <n-text depth="3" style="display: block; margin-bottom: 12px">
        用于登记已经通过其他方式上传到存储中的文件，不会再次上传文件内容。
      </n-text>
      <n-button block secondary @click="onChooseLocalFile">
        <template #icon>
          <n-icon>
            <FileIcon />
          </n-icon>
        </template>
        从本地文件读取名称和大小
      </n-button>
      <n-form ref="formRef" class="dialog-form" :model="form">
        <n-form-item
          path="name"
          label="文件名"
          :rule="[{ required: true, message: '请输入文件名' }]"
        >
          <n-input
            v-model:value="form.name"
            placeholder="文件名（含后缀）"
            clearable
          />
        </n-form-item>

        <n-form-item
          path="size"
          label="文件大小（字节）"
          :rule="[{ required: true, type: 'number', message: '请输入文件大小' }]"
        >
          <div style="width: 100%">
            <n-input-number
              v-model:value="form.size"
              :min="0"
              :precision="0"
              placeholder="文件大小（字节）"
              style="width: 100%"
            />
            <n-text depth="3" style="display: block; margin-top: 4px">
              约 {{ formatFileSize(form.size ?? 0) }}
            </n-text>
          </div>
        </n-form-item>

        <n-form-item path="storageMode" label="存储策略">
          <n-select
            v-model:value="form.storageMode"
            :options="storageModeOptions"
            @update:value="onStorageModeChange"
          />
        </n-form-item>

        <n-form-item path="fileGroupId" label="文件组">
          <n-select
            v-model:value="form.fileGroupId"
            :options="fileGroupOptions"
            placeholder="留空为默认分组（根目录）"
            clearable
          />
        </n-form-item>
      </n-form>
    </template>
  </n-modal>
</template>

<style scoped></style>
