<script setup lang="ts">
import { NSpace } from 'naive-ui';
import {
  CloudUploadOutline as UploadIcon,
  CloudDownloadOutline as DownloadIcon,
  CodeDownloadOutline as CodeDownloadIcon,
  RefreshOutline as RefreshIcon,
  TimeOutline as TimeIcon
} from '@vicons/ionicons5';
import MyBackupCard from '../components/component/MyBackupCard.vue';
</script>

<template>
  <div class="container">
    <n-space>
      <my-backup-card
        title="导入文章"
        content="上传 Markdown 或 Txt"
        tips="导入 Markdown 或 Txt 文本文件，作为新文章发布"
      >
        <template #icon>
          <UploadIcon />
        </template>
      </my-backup-card>

      <my-backup-card
        title="导出文章"
        content="导出 Markdown"
        tips="将博客文章导出为 Markdown 文件保存到本地"
      >
        <template #icon>
          <DownloadIcon />
        </template>
      </my-backup-card>

      <my-backup-card
        title="导出数据"
        content="导出全站数据"
        tips="将全站所有数据打包后保存到本地"
      >
        <template #icon>
          <CodeDownloadIcon />
        </template>
      </my-backup-card>

      <my-backup-card
        title="恢复数据"
        content="恢复全站数据"
        tips="将之前打包的全站数据恢复到博客"
      >
        <template #icon>
          <RefreshIcon />
        </template>
      </my-backup-card>

      <my-backup-card
        title="定时备份"
        content="定时备份数据"
        tips="每隔一段时间在服务端进行一次数据备份"
      >
        <template #icon>
          <TimeIcon />
        </template>
      </my-backup-card>
    </n-space>
  </div>
</template>

<style scoped></style>
