<script setup lang="ts">
import { ref } from 'vue';
import {
  NAlert,
  NDataTable,
  NDescriptions,
  NDescriptionsItem,
  NModal,
  NSelect,
  NSpace,
  NText,
  SelectOption,
  DataTableColumns
} from 'naive-ui';
import {
  CloudUploadOutline as UploadIcon,
  CloudDownloadOutline as DownloadIcon,
  RefreshOutline as RefreshIcon
} from '@vicons/ionicons5';
import MyBackupCard from '../components/component/MyBackupCard.vue';
import {
  applyBackupRestore,
  downloadBackupFile,
  exportBackupPosts,
  importBackupPosts,
  previewBackupRestore
} from '../apis/backupApi.ts';
import {
  ExportPostBackupResult,
  ImportPostBackupResult,
  RestorePreview,
  RestorePreviewFile,
  RestoreResult
} from '../models/Backup.ts';
import { RestoreConflictStrategy } from '../models/enum/RestoreConflictStrategy.ts';
import {
  confirmDialogAsync,
  errorMsg,
  successMsg
} from '../utils/Message.ts';
import { formatTimestamp } from '../utils/MyUtils.ts';
import { useGlobalStore } from '../stores/GlobalStore.ts';

const globalStore = useGlobalStore();

// 导入文件选择框引用
const importFileInput = ref<HTMLInputElement | null>(null);
// 恢复文件选择框引用
const restoreFileInput = ref<HTMLInputElement | null>(null);

// 导入结果
const importResult = ref<ImportPostBackupResult | null>(null);
// 是否显示导入结果模态框
const visibleImportResult = ref(false);

// 导出结果
const exportResult = ref<ExportPostBackupResult | null>(null);
// 是否显示导出结果模态框
const visibleExportResult = ref(false);

// 恢复预览
const restorePreview = ref<RestorePreview | null>(null);
// 是否显示恢复预览模态框
const visibleRestorePreview = ref(false);
// 冲突处理策略
const conflictStrategy = ref<RestoreConflictStrategy>(
  RestoreConflictStrategy.SKIP
);
// 恢复是否执行中
const isRestoreApplying = ref(false);

// 恢复结果
const restoreResult = ref<RestoreResult | null>(null);
// 是否显示恢复结果模态框
const visibleRestoreResult = ref(false);

// 冲突处理策略选项
const conflictStrategyOptions: Array<SelectOption> = [
  {
    label: '跳过冲突文件（SKIP）',
    value: RestoreConflictStrategy.SKIP
  },
  {
    label: '重命名冲突文章（RENAME）',
    value: RestoreConflictStrategy.RENAME
  }
];

// 恢复预览文件类型文案
const restoreFileTypeDisplayName: Record<string, string> = {
  PUBLISHED: '已发布文章',
  DRAFT: '草稿',
  INVALID: '无法识别'
};

// 恢复预览预计操作文案
const restoreActionDisplayName: Record<string, string> = {
  CREATE: '新建文章',
  UPDATE_CONTENT: '更新正文',
  ADD_DRAFT: '新增草稿',
  SKIP: '跳过',
  CONFLICT: '冲突',
  INVALID: '无法识别'
};

// 恢复预览文件明细列
const restoreFileColumns: DataTableColumns<RestorePreviewFile> = [
  {
    title: '文件',
    key: 'fileName',
    minWidth: 200,
    ellipsis: { tooltip: true }
  },
  {
    title: '类型',
    key: 'type',
    width: 90,
    render: (row) => restoreFileTypeDisplayName[row.type] ?? row.type
  },
  {
    title: '预计操作',
    key: 'action',
    width: 110,
    render: (row) => restoreActionDisplayName[row.action] ?? row.action
  },
  {
    title: '说明',
    key: 'reason',
    minWidth: 260,
    ellipsis: { tooltip: true }
  }
];

/**
 * 将导入文件名扩展名转为小写，后端按大小写匹配扩展名
 * @param files 待导入的文件
 */
const normalizeImportFileNames = (files: Array<File>) => {
  return files.map((file) => {
    const name = file.name.replace(/\.(md|txt)$/i, (ext) => ext.toLowerCase());
    if (name === file.name) {
      return file;
    }
    return new File([file], name, {
      type: file.type,
      lastModified: file.lastModified
    });
  });
};

/**
 * 导入文章卡片点击事件
 */
const onImportClick = () => {
  importFileInput.value?.click();
};

/**
 * 导出文章卡片点击事件
 */
const onExportClick = () => {
  window.$loadingBar.start();
  exportBackupPosts()
    .then(async (res) => {
      const result = res.data as ExportPostBackupResult;
      const fileName = result.path.split('/').pop();
      if (!fileName) {
        throw new Error('导出结果中缺少备份文件名');
      }
      const blob = await downloadBackupFile(fileName);
      saveBlob(blob, fileName);
      window.$loadingBar.finish();

      if (result.failCount > 0) {
        exportResult.value = result;
        visibleExportResult.value = true;
      } else {
        successMsg(`已导出 ${result.successCount} 篇文章`);
      }
    })
    .catch((err) => {
      window.$loadingBar.error();
      // Axios 错误已由拦截器提示，这里只提示下载等自定义错误
      if (err instanceof Error) {
        errorMsg(err.message);
      }
    });
};

/**
 * 恢复数据卡片点击事件
 */
const onRestoreClick = () => {
  restoreFileInput.value?.click();
};

/**
 * 导入文件选择事件
 * @param event 选择事件
 */
const onImportFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const files = Array.from(input.files ?? []);
  input.value = '';
  if (files.length === 0) {
    return;
  }

  const invalidFiles = files.filter((file) => {
    return !/\.(md|txt)$/i.test(file.name);
  });
  if (invalidFiles.length > 0) {
    errorMsg('只支持导入 .md 或 .txt 文件');
    return;
  }

  window.$loadingBar.start();
  importBackupPosts(normalizeImportFileNames(files))
    .then((res) => {
      window.$loadingBar.finish();
      importResult.value = res.data as ImportPostBackupResult;
      visibleImportResult.value = true;
    })
    .catch(() => {
      window.$loadingBar.error();
    });
};

/**
 * 恢复文件选择事件
 * @param event 选择事件
 */
const onRestoreFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';
  if (!file) {
    return;
  }
  if (!file.name.toLowerCase().endsWith('.zip')) {
    errorMsg('请选择 .zip 格式的备份文件');
    return;
  }

  window.$loadingBar.start();
  previewBackupRestore(file)
    .then((res) => {
      window.$loadingBar.finish();
      restorePreview.value = res.data as RestorePreview;
      conflictStrategy.value = RestoreConflictStrategy.SKIP;
      visibleRestorePreview.value = true;
    })
    .catch(() => {
      window.$loadingBar.error();
    });
};

/**
 * 执行备份恢复
 */
const onApplyRestore = async () => {
  if (!restorePreview.value) {
    return false;
  }
  const preview = restorePreview.value;
  const strategyLabel =
    conflictStrategyOptions.find(
      (option) => option.value === conflictStrategy.value
    )?.label ?? conflictStrategy.value;
  const confirmed = await confirmDialogAsync(
    `确定执行恢复吗？将新建 ${preview.createPostCount} 篇文章、更新 ${preview.updatePostCount} 篇文章正文、新增 ${preview.addDraftCount} 个草稿。冲突策略：${strategyLabel}。此操作不可撤销。`
  );
  if (!confirmed) {
    return false;
  }
  isRestoreApplying.value = true;
  applyBackupRestore(preview.token, conflictStrategy.value)
    .then((res) => {
      isRestoreApplying.value = false;
      visibleRestorePreview.value = false;
      restoreResult.value = res.data as RestoreResult;
      visibleRestoreResult.value = true;
      successMsg('恢复完成');
    })
    .catch(() => {
      isRestoreApplying.value = false;
    });
  return false;
};

/**
 * 保存 Blob 为本地文件
 * @param blob 文件内容
 * @param fileName 文件名
 */
const saveBlob = (blob: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => {
    window.URL.revokeObjectURL(url);
  }, 1000);
};
</script>

<template>
  <div class="container">
    <!-- 隐藏的文件选择框 -->
    <input
      ref="importFileInput"
      type="file"
      accept=".md,.txt"
      multiple
      style="display: none"
      @change="onImportFileChange"
    />
    <input
      ref="restoreFileInput"
      type="file"
      accept=".zip"
      style="display: none"
      @change="onRestoreFileChange"
    />

    <!-- 导入结果模态框 -->
    <n-modal
      v-model:show="visibleImportResult"
      preset="dialog"
      title="导入结果"
      positive-text="知道了"
      @positive-click="visibleImportResult = false"
    >
      <template #default>
        <n-descriptions bordered :column="1" size="small">
          <n-descriptions-item label="文件总数">
            {{ importResult?.fileCount ?? 0 }}
          </n-descriptions-item>
          <n-descriptions-item label="成功数量">
            {{ importResult?.successCount ?? 0 }}
          </n-descriptions-item>
          <n-descriptions-item label="失败数量">
            {{ importResult?.failCount ?? 0 }}
          </n-descriptions-item>
        </n-descriptions>
        <n-alert
          v-if="(importResult?.failResult.length ?? 0) > 0"
          type="warning"
          title="失败详情"
          style="margin-top: 12px"
        >
          <div class="failure-list">
            <n-text
              v-for="(fail, index) in importResult?.failResult"
              :key="index"
              depth="2"
              tag="div"
            >
              {{ fail }}
            </n-text>
          </div>
        </n-alert>
      </template>
    </n-modal>

    <!-- 导出结果模态框 -->
    <n-modal
      v-model:show="visibleExportResult"
      preset="dialog"
      title="导出结果"
      positive-text="知道了"
      @positive-click="visibleExportResult = false"
    >
      <template #default>
        <n-descriptions bordered :column="1" size="small">
          <n-descriptions-item label="文章总数">
            {{ exportResult?.count ?? 0 }}
          </n-descriptions-item>
          <n-descriptions-item label="成功数量">
            {{ exportResult?.successCount ?? 0 }}
          </n-descriptions-item>
          <n-descriptions-item label="失败数量">
            {{ exportResult?.failCount ?? 0 }}
          </n-descriptions-item>
        </n-descriptions>
        <n-alert
          v-if="(exportResult?.failResult.length ?? 0) > 0"
          type="warning"
          title="失败详情"
          style="margin-top: 12px"
        >
          <div class="failure-list">
            <n-text
              v-for="(fail, index) in exportResult?.failResult"
              :key="index"
              depth="2"
              tag="div"
            >
              {{ fail }}
            </n-text>
          </div>
        </n-alert>
      </template>
    </n-modal>

    <!-- 恢复预览模态框 -->
    <n-modal
      v-model:show="visibleRestorePreview"
      preset="dialog"
      title="恢复文章预览"
      positive-text="执行恢复"
      negative-text="取消"
      :loading="isRestoreApplying"
      :positive-button-props="{ type: 'error' }"
      :mask-closable="!isRestoreApplying"
      :close-on-esc="!isRestoreApplying"
      style="width: 760px; max-width: 95vw"
      @positive-click="onApplyRestore"
      @negative-click="visibleRestorePreview = false"
    >
      <template #default>
        <n-space vertical :size="12">
          <n-descriptions
            bordered
            :column="globalStore.isSmallWindow ? 1 : 2"
            size="small"
          >
            <n-descriptions-item label="文件总数">
              {{ restorePreview?.totalFiles ?? 0 }}
            </n-descriptions-item>
            <n-descriptions-item label="正文文件">
              {{ restorePreview?.publishedFiles ?? 0 }}
            </n-descriptions-item>
            <n-descriptions-item label="草稿文件">
              {{ restorePreview?.draftFiles ?? 0 }}
            </n-descriptions-item>
            <n-descriptions-item label="冲突文件">
              {{ restorePreview?.conflictCount ?? 0 }}
            </n-descriptions-item>
            <n-descriptions-item label="预计新建文章">
              {{ restorePreview?.createPostCount ?? 0 }}
            </n-descriptions-item>
            <n-descriptions-item label="预计更新正文">
              {{ restorePreview?.updatePostCount ?? 0 }}
            </n-descriptions-item>
            <n-descriptions-item label="预计新增草稿">
              {{ restorePreview?.addDraftCount ?? 0 }}
            </n-descriptions-item>
            <n-descriptions-item label="预计跳过">
              {{ restorePreview?.skipCount ?? 0 }}
            </n-descriptions-item>
            <n-descriptions-item label="无法识别">
              {{ restorePreview?.invalidCount ?? 0 }}
            </n-descriptions-item>
            <n-descriptions-item label="令牌过期时间">
              {{
                restorePreview ? formatTimestamp(restorePreview.expiresAt) : '—'
              }}
            </n-descriptions-item>
          </n-descriptions>

          <n-alert
            v-if="(restorePreview?.warnings.length ?? 0) > 0"
            type="warning"
            title="恢复限制说明"
          >
            <div class="failure-list">
              <n-text
                v-for="(warning, index) in restorePreview?.warnings"
                :key="index"
                depth="2"
                tag="div"
              >
                {{ warning }}
              </n-text>
            </div>
          </n-alert>

          <n-space vertical :size="6">
            <n-text depth="3">冲突处理策略</n-text>
            <n-select
              v-model:value="conflictStrategy"
              :options="conflictStrategyOptions"
            />
          </n-space>

          <n-data-table
            :columns="restoreFileColumns"
            :data="restorePreview?.files ?? []"
            :max-height="240"
            :scroll-x="660"
            size="small"
            :bordered="false"
          />
        </n-space>
      </template>
    </n-modal>

    <!-- 恢复结果模态框 -->
    <n-modal
      v-model:show="visibleRestoreResult"
      preset="dialog"
      title="恢复结果"
      positive-text="知道了"
      @positive-click="visibleRestoreResult = false"
    >
      <template #default>
        <n-descriptions
          bordered
          :column="globalStore.isSmallWindow ? 1 : 2"
          size="small"
        >
          <n-descriptions-item label="新建文章">
            {{ restoreResult?.createdPosts ?? 0 }}
          </n-descriptions-item>
          <n-descriptions-item label="更新正文">
            {{ restoreResult?.updatedPosts ?? 0 }}
          </n-descriptions-item>
          <n-descriptions-item label="新增草稿">
            {{ restoreResult?.addedDrafts ?? 0 }}
          </n-descriptions-item>
          <n-descriptions-item label="跳过文件">
            {{ restoreResult?.skippedFiles ?? 0 }}
          </n-descriptions-item>
          <n-descriptions-item label="失败文件">
            {{ restoreResult?.failedFiles ?? 0 }}
          </n-descriptions-item>
        </n-descriptions>
        <n-alert
          v-if="(restoreResult?.failures.length ?? 0) > 0"
          type="error"
          title="失败原因"
          style="margin-top: 12px"
        >
          <div class="failure-list">
            <n-text
              v-for="(failure, index) in restoreResult?.failures"
              :key="index"
              depth="2"
              tag="div"
            >
              {{ failure }}
            </n-text>
          </div>
        </n-alert>
      </template>
    </n-modal>

    <n-space vertical :size="12">
      <div class="backup-card-row">
        <my-backup-card
          title="导入文章"
          content="上传 Markdown 或 Txt"
          tips="导入 Markdown 或 Txt 文本文件，作为新文章发布"
          @on-click="onImportClick"
        >
          <template #icon>
            <UploadIcon />
          </template>
        </my-backup-card>

        <my-backup-card
          title="导出文章"
          content="导出 Markdown"
          tips="将博客文章导出为 Markdown 压缩包并下载到本地"
          @on-click="onExportClick"
        >
          <template #icon>
            <DownloadIcon />
          </template>
        </my-backup-card>

        <my-backup-card
          title="恢复文章"
          content="恢复正文与草稿"
          tips="上传之前导出的 zip 备份，预览后执行恢复"
          @on-click="onRestoreClick"
        >
          <template #icon>
            <RefreshIcon />
          </template>
        </my-backup-card>
      </div>

      <n-alert type="default" :show-icon="false">
        导出的备份文件保存在服务端 .nola/backup 目录，下载需要管理员登录态。恢复仅还原文章正文和草稿，不包含标签、分类等元数据，并且属于高风险操作。
      </n-alert>
    </n-space>
  </div>
</template>

<style scoped>
.backup-card-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.failure-list {
  max-height: 200px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
