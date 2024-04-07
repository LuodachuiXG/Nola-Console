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
  NInput,
  NDropdown,
  NForm,
  NFormItem,
  NModal,
  FormInst
} from 'naive-ui';
import { onMounted, reactive, ref } from 'vue';
import {
  MenuOutline as MenuIcon,
  CloudUploadOutline as UploadIcon,
  SearchOutline as SearchIcon,
  SettingsOutline as SettingIcon,
  TrashOutline as TrashIcon,
  AddOutline as AddIcon,
  BrushOutline as EditIcon
} from '@vicons/ionicons5';
import {
  FileStorageDisplayName,
  FileStorageMode
} from '../../models/enum/FileStorageMode.ts';
import {
  addFileGroup,
  delFileGroup,
  delTencentCOS,
  getFileGroups,
  getFiles,
  getStorageModes,
  updateFileGroup
} from '../../apis/fileApi.ts';
import { confirmDialog, errorMsg, successMsg } from '../../utils/Message.ts';
import { FileGroup } from '../../models/FileGroup.ts';
import { MFile } from '../../models/MFile.ts';
import { FileSort } from '../../models/enum/FileSort.ts';
import { Pager } from '../../models/Pager.ts';
import FileItem from '../item/FileItem.vue';
import MyFileInfoModal from './MyFileInfoModal.vue';
import { renderIcon } from '../../utils/MyUtils.ts';
import MyFileStorageModeConfigModal from './MyFileStorageModeConfigModal.vue';
import { DialogFormMode } from '../../models/enum/DialogFormMode.ts';

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
// 存储策略管理下拉菜单
const storageModeManagerSelectOptions: Array<SelectOption> = [
  {
    label: '配置存储策略',
    key: 'config',
    icon: renderIcon(SettingIcon)
  },
  {
    type: 'divider'
  },
  {
    label: '删除存储策略',
    key: 'delete',
    icon: renderIcon(TrashIcon)
  }
];

// 文件分组下拉框选项
const fileGroupSelectOptions = ref<Array<SelectOption>>([]);
// 文件分组下拉框值
const fileGroupValue = ref<number | null>(null);
// 当前选择的存储策略的文件分组
const fileGroups = ref<Array<FileGroup>>([]);
// 文件分组管理下拉菜单
const fileGroupManagerSelectOptions: Array<SelectOption> = [
  {
    label: '添加分组',
    key: 'add',
    icon: renderIcon(AddIcon)
  },
  {
    label: '修改分组',
    key: 'update',
    icon: renderIcon(EditIcon)
  },
  {
    label: '删除分组',
    key: 'delete',
    icon: renderIcon(TrashIcon)
  }
];
// 文件分组模态框模式
const fileGroupModalMode = ref<DialogFormMode>(DialogFormMode.ADD);
// 是否显示文件分组模态框
const visibleFileGroupModal = ref(false);
// 文件分组模态框表单
const formFileGroup: FileGroup = reactive({
  fileGroupId: -1,
  displayName: '',
  path: '',
  storageMode: FileStorageMode.LOCAL
});
// 可用的文件存储策略选择项
const availableFileStorageModesSelectOptions = ref<Array<SelectOption>>([]);
const formFileGroupRef = ref<FormInst | null>(null);
// 文件分组表单是否加载中
const formFileGroupIsLoading = ref(false);

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

// 当前点击的文件
const currentClickFile = ref<MFile | null>(null);
// 是否显示文件信息模态框
const visibleFileInfoModal = ref(false);

// 是否显示文件存储策略配置模态框
const visibleFileStorageModeConfigModal = ref(false);

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
    fileGroupValue.value,
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
  storageModeSelectOptions.value = [];
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
  // 重新获取当前存储策略的文件分组
  refreshFileGroups();
  // 获取文件
  refreshFiles();
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

/**
 * 文件项标题点击事件
 * @param file 文件接口
 */
const onFileItemTitleClick = (file: MFile) => {
  currentClickFile.value = file;
  visibleFileInfoModal.value = true;
};

/**
 * 文件信息模态框，文件分组点击事件
 * @param file
 */
const onFileInfoModalFileGroupClick = (file: MFile) => {
  // 设置文件存储策略和分组为当前文件的存储策略和分组
  storageModeValue.value = file.storageMode;
  // 刷新一下文件分组
  refreshFileGroups();
  fileGroupValue.value = file.fileGroupId;
  // 清空可能不为空的关键字检索
  fileKey.value = '';
  // 关闭文件信息模态框
  visibleFileInfoModal.value = false;
  // 刷新文件
  refreshFiles();
};

/**
 * 文件信息模态框，文件存储策略点击事件
 * @param file
 */
const onFileInfoModalStorageModeClick = (file: MFile) => {
  // 设置文件存储策略和分组为当前文件的存储策略和分组
  storageModeValue.value = file.storageMode;
  // 清空可能不为空的关键字和文件分组
  fileGroupValue.value = null;
  fileKey.value = '';
  // 关闭文件信息模态框
  visibleFileInfoModal.value = false;
  // 刷新文件
  refreshFiles();
};

/**
 * 存储策略管理下拉菜单选择事件
 * @param value
 */
const onStorageModeManagerSelect = (value: string) => {
  switch (value) {
    case 'config':
      visibleFileStorageModeConfigModal.value = true;
      break;
    case 'delete':
      if (storageModeValue.value === null) {
        errorMsg('请先选择要删除的存储策略');
        return;
      }
      if (storageModeValue.value === FileStorageMode.LOCAL) {
        errorMsg('本地存储策略不能删除');
        return;
      }

      confirmDialog(
        `确定要删除${FileStorageDisplayName[storageModeValue.value]}吗`,
        () => {
          delTencentCOS()
            .then(() => {
              // 删除成功，刷新存储策略和文件分组
              refreshFileStorageMode();
              refreshFileGroups();
            })
            .catch((err) => errorMsg(err));
        }
      );
      break;
  }
};

/**
 * 存储策略配置模态框保存完成事件
 */
const onFileStorageModeModalSaveFinish = () => {
  // 刷新存储策略
  refreshFileStorageMode();
};

/**
 * 清空文件分组表单
 */
const clearFileGroupForm = () => {
  formFileGroup.fileGroupId = -1;
  formFileGroup.displayName = '';
  formFileGroup.path = '';
  formFileGroup.storageMode = FileStorageMode.LOCAL;
};

/**
 * 文件分组管理下拉菜单选择事件
 * @param value
 */
const onFileGroupManagerSelect = (value: string) => {
  switch (value) {
    case 'add':
      // 添加分组
      fileGroupModalMode.value = DialogFormMode.ADD;
      // 清空表单
      clearFileGroupForm();
      // 填充可用存储策略下拉菜单项
      refreshAvailableStorageModes2SelectOptions();
      visibleFileGroupModal.value = true;
      break;
    case 'update':
      // 修改分组
      fileGroupModalMode.value = DialogFormMode.EDIT;
      // 清空表单
      clearFileGroupForm();
      // 填充可用存储策略下拉菜单项
      refreshAvailableStorageModes2SelectOptions();

      // 当前的文件分组信息填充到表单中
      if (!fileGroupValue.value) {
        errorMsg('请先选择要修改的分组');
        return;
      }
      var fileGroup = fileGroups.value.find(
        (fg) => fg.fileGroupId === fileGroupValue.value
      )!!;
      formFileGroup.fileGroupId = fileGroup.fileGroupId;
      formFileGroup.displayName = fileGroup.displayName;
      formFileGroup.path = fileGroup.path;
      formFileGroup.storageMode = fileGroup.storageMode;
      visibleFileGroupModal.value = true;
      break;
    case 'delete':
      // 删除分组
      if (!fileGroupValue.value) {
        errorMsg('请先选择要删除的分组');
        return;
      }

      var fileGroup = fileGroups.value.find(
        (fg) => fg.fileGroupId === fileGroupValue.value
      )!!;
      confirmDialog(
        `确定要删除文件分组 [${fileGroup.displayName}] 吗？`,
        () => {
          delFileGroup(fileGroupValue.value!!)
            .then(() => {
              // 删除成功
              successMsg('删除成功');
              // 刷新文件分组列表
              refreshFileGroups();
            })
            .catch((err) => errorMsg(err));
        }
      );
      break;
  }
};

/**
 * 获取可用文件分组
 * 并将可用的文件分组添加到文件分组模态框的存储策略选择下拉菜单项中
 */
const refreshAvailableStorageModes2SelectOptions = () => {
  getStorageModes()
    .then((res) => {
      const storageModes = res.data as Array<FileStorageMode>;
      availableFileStorageModesSelectOptions.value = [];
      storageModes.forEach((sm) => {
        availableFileStorageModesSelectOptions.value.push({
          label: FileStorageDisplayName[sm],
          value: sm
        });
      });
    })
    .catch((err) => errorMsg(`获取可用存储策略失败：${err}`));
};

/**
 * 文件分组模态框提交事件
 */
const onFileGroupModalSubmit = () => {
  formFileGroupRef.value?.validate((errors) => {
    if (!errors) {
      formFileGroupIsLoading.value = true;
      if (fileGroupModalMode.value === DialogFormMode.ADD) {
        // 添加模式
        addFileGroup(
          formFileGroup.displayName,
          formFileGroup.path,
          formFileGroup.storageMode
        )
          .then(() => {
            formFileGroupIsLoading.value = false;
            // 添加成功
            successMsg('添加成功');
            // 刷新文件组列表
            refreshFileGroups();
            // 关闭模态框
            visibleFileGroupModal.value = false;
            formFileGroupIsLoading.value = false;
          })
          .catch((err) => {
            formFileGroupIsLoading.value = false;
            errorMsg(`添加失败：${err}`);
          });
      } else {
        // 修改模式
        updateFileGroup(formFileGroup.fileGroupId, formFileGroup.displayName)
          .then(() => {
            // 修改成功
            successMsg('修改成功');
            // 刷新文件组列表
            refreshFileGroups();
            // 关闭模态框
            visibleFileGroupModal.value = false;
            formFileGroupIsLoading.value = false;
          })
          .catch((err) => {
            formFileGroupIsLoading.value = false;
            errorMsg(`修改失败：${err}`);
          });
      }
    }
  });
  return false;
};
</script>

<template>
  <div class="container">
    <!-- 存储策略配置模态框 -->
    <my-file-storage-mode-config-modal
      v-model:show="visibleFileStorageModeConfigModal"
      @on-save-finish="onFileStorageModeModalSaveFinish"
    />

    <!-- 文件信息模态框 -->
    <my-file-info-modal
      :file="currentClickFile"
      v-model:show="visibleFileInfoModal"
      @on-file-group-click="onFileInfoModalFileGroupClick"
      @on-storage-mode-click="onFileInfoModalStorageModeClick"
    />

    <!-- 文件分组模态框 -->
    <n-modal
      v-model:show="visibleFileGroupModal"
      preset="dialog"
      :title="
        fileGroupModalMode === DialogFormMode.ADD ? '添加分组' : '修改分组'
      "
      :positive-text="
        fileGroupModalMode === DialogFormMode.ADD ? '添加' : '保存'
      "
      negative-text="关闭"
      :loading="formFileGroupIsLoading"
      @positive-click="onFileGroupModalSubmit"
      @negativeClick="visibleFileGroupModal = false"
    >
      <template #default>
        <n-form
          ref="formFileGroupRef"
          class="dialog-form"
          :model="formFileGroup"
        >
          <n-form-item
            path="displayName"
            label="分组名"
            :rule="[{ required: true, message: '请输入分组名' }]"
          >
            <n-input
              placeholder="分组名"
              v-model:value="formFileGroup.displayName"
              clearable
            />
          </n-form-item>

          <n-form-item
            path="path"
            label="分组路径"
            :rule="[{ required: true, message: '请输入分组路径' }]"
          >
            <n-input
              placeholder="分组路径，当前分组下的文件的存储路径"
              v-model:value="formFileGroup.path"
              :disabled="fileGroupModalMode === DialogFormMode.EDIT"
              clearable
            />
          </n-form-item>

          <n-form-item
            path="storageMode"
            label="存储策略"
            :rule="[{ required: true, message: '请选择存储策略' }]"
          >
            <n-select
              :options="availableFileStorageModesSelectOptions"
              v-model:value="formFileGroup.storageMode"
              :disabled="fileGroupModalMode === DialogFormMode.EDIT"
            />
          </n-form-item>
        </n-form>
      </template>
    </n-modal>

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

          <n-dropdown
            trigger="click"
            :options="storageModeManagerSelectOptions"
            @select="onStorageModeManagerSelect"
            show-arrow
          >
            <n-button>
              <template #icon>
                <n-icon>
                  <MenuIcon />
                </n-icon>
              </template>
            </n-button>
          </n-dropdown>
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

          <n-dropdown
            trigger="click"
            :options="fileGroupManagerSelectOptions"
            @select="onFileGroupManagerSelect"
            show-arrow
          >
            <n-button>
              <template #icon>
                <n-icon>
                  <MenuIcon />
                </n-icon>
              </template>
            </n-button>
          </n-dropdown>
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
            @on-title-click="onFileItemTitleClick"
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
