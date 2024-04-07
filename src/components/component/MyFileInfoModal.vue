<!-- 文件信息模态框 -->
<script setup lang="ts">
import {
  NList,
  NListItem,
  NModal,
  NScrollbar,
  NThing,
  NText,
  NCard,
  NButton,
  NSpace
} from 'naive-ui';
import { MFile } from '../../models/MFile.ts';
import {
  FileStorageDisplayName,
  FileStorageMode
} from '../../models/enum/FileStorageMode.ts';
import {
  formatFileSize,
  formatTimestamp,
  isImage
} from '../../utils/MyUtils.ts';
import { errorMsg, successMsg } from '../../utils/Message.ts';
import { onMounted, ref, watch } from 'vue';

interface Props {
  file: MFile | null;
}

const props = defineProps<Props>();

// 是否显示模态框
const show = defineModel('show', {
  type: Boolean,
  default: false
});

const emit = defineEmits<{
  (e: 'onStorageModeClick', file: MFile): void;
  (e: 'onFileGroupClick', file: MFile): void;
}>();

// HTMl 和 Markdown 格式的文件链接
const htmlUrl = ref('');
const markdownUrl = ref('');

onMounted(() => {
  watch(
    () => props.file,
    () => {
      if (props.file) {
        if (isImage(props.file.url)) {
          htmlUrl.value = `<img src="${props.file.url}" alt="${props.file.displayName}" />`;
          markdownUrl.value = `![${props.file.displayName}](${props.file.url})`;
        } else {
          htmlUrl.value = `<a href="${props.file.url}" target="_blank">${props.file.displayName}</a>`;
          markdownUrl.value = `[${props.file.displayName}](${props.file.url})`;
        }
      }
    },
    { immediate: true }
  );
});

/**
 * 文件链接点击事件
 */
const onFileUrlClick = () => {
  window.open(props.file?.url, '_blank');
};

/**
 * 复制文本到剪贴板
 * @param str 文本
 */
const onCopyText = (str: string | null | undefined) => {
  navigator.clipboard
    .writeText(str ?? '')
    .then(() => {
      successMsg('复制成功');
    })
    .catch((err) => errorMsg(`复制失败：${err}`));
};

/**
 * 下载文件按钮点击事件
 */
const onDownloadClick = () => {
  const file = props.file;
  if (file) {
    downloadFile(file.url, file.displayName);
  }
};

/**
 * 下载文件（跨域无效）
 * @param url
 * @param fileName
 */
const downloadFile = (url: string, fileName: string) => {
  // 创建隐藏的可下载链接
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = fileName;

  // 触发点击下载
  document.body.appendChild(a);
  a.click();

  // 清理
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

/**
 * 存储策略点击事件
 */
const onStorageModeClick = () => {
  emit('onStorageModeClick', props.file!!);
};

/**
 * 文件组点击事件
 */
const onFileGroupClick = () => {
  emit('onFileGroupClick', props.file!!);
};
</script>

<template>
  <!-- 管理员个人信息模态框 -->
  <n-modal
    v-model:show="show"
    preset="dialog"
    title="文件信息"
    :positive-text="file?.storageMode === FileStorageMode.LOCAL ? '下载' : ''"
    negative-text="关闭"
    @positive-click="onDownloadClick"
    @negativeClick="show = false"
  >
    <template #default>
      <n-scrollbar style="max-height: 70vh; padding-right: 12px">
        <n-list>
          <n-list-item>
            <n-thing title="文件名">
              <template #description>
                {{ file?.displayName }}
              </template>
            </n-thing>
          </n-list-item>
          <n-list-item>
            <n-thing title="文件大小">
              <template #description>
                <n-text>{{ formatFileSize(file?.size ?? 0) }}</n-text>
              </template>
            </n-thing>
          </n-list-item>
          <n-list-item v-if="file?.fileGroupName">
            <n-thing title="文件组">
              <template #description>
                <n-text
                  class="pointer"
                  type="primary"
                  @click="onFileGroupClick"
                >
                  {{ file?.fileGroupName }}
                </n-text>
              </template>
            </n-thing>
          </n-list-item>
          <n-list-item>
            <n-thing title="存储策略">
              <template #description>
                <n-text
                  type="primary"
                  class="pointer"
                  @click="onStorageModeClick"
                >
                  {{
                    FileStorageDisplayName[
                      file?.storageMode ?? FileStorageMode.LOCAL
                    ]
                  }}
                </n-text>
              </template>
            </n-thing>
          </n-list-item>
          <n-list-item>
            <n-thing title="文件地址">
              <template #description>
                <n-text class="pointer" type="primary" @click="onFileUrlClick">
                  {{ file?.url }}
                </n-text>
              </template>
            </n-thing>
          </n-list-item>
          <n-list-item>
            <n-thing title="上传时间">
              <template #description>
                <n-text>
                  {{ formatTimestamp(file?.createTime ?? 0) }}
                </n-text>
              </template>
            </n-thing>
          </n-list-item>
          <n-list-item>
            <n-thing title="链接">
              <template #description>
                <n-space vertical>
                  <n-card
                    header-style="padding: 5px 10px 0 10px;"
                    content-style="padding: 0 10px 10px 10px"
                  >
                    <template #header>
                      <n-text class="url-title">URL</n-text>
                    </template>
                    {{ file?.url }}
                    <template #header-extra>
                      <n-button size="tiny" @click="onCopyText(file?.url)"
                        >复制
                      </n-button>
                    </template>
                  </n-card>

                  <n-card
                    header-style="padding: 5px 10px 0 10px;"
                    content-style="padding: 0 10px 10px 10px"
                  >
                    <template #header>
                      <n-text class="url-title">Markdown</n-text>
                    </template>
                    {{ markdownUrl }}
                    <template #header-extra>
                      <n-button size="tiny" @click="onCopyText(markdownUrl)"
                        >复制
                      </n-button>
                    </template>
                  </n-card>

                  <n-card
                    header-style="padding: 5px 10px 0 10px;"
                    content-style="padding: 0 10px 10px 10px"
                  >
                    <template #header>
                      <n-text class="url-title">HTML</n-text>
                    </template>
                    {{ htmlUrl }}
                    <template #header-extra>
                      <n-button size="tiny" @click="onCopyText(htmlUrl)"
                        >复制
                      </n-button>
                    </template>
                  </n-card>
                </n-space>
              </template>
            </n-thing>
          </n-list-item>
        </n-list>
      </n-scrollbar>
    </template>
  </n-modal>
</template>

<style scoped>
.url-title {
  font-size: 0.8em;
  font-weight: bold;
}
</style>
