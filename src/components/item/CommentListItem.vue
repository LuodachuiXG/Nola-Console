<!-- 评论列表项 -->
<script setup lang="ts">
import {
  NButton,
  NButtonGroup,
  NCheckbox,
  NIcon,
  NListItem,
  NSpace,
  NTag,
  NText,
  NThing
} from 'naive-ui';
import {
  BrushOutline as EditIcon,
  ChatboxOutline as ReplyIcon,
  CheckmarkDoneOutline as PassIcon,
  CloseCircleOutline as CancelPassIcon,
  TrashOutline as TrashIcon
} from '@vicons/ionicons5';
import { Comment } from '../../models/Comment.ts';
import { formatTimestamp } from '../../utils/MyUtils.ts';
import { useGlobalStore } from '../../stores/GlobalStore.ts';

interface Props {
  /** 评论接口 **/
  comment: Comment;
  /** 是否选中 **/
  isChecked: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'onEdit', comment: Comment): void;
  (e: 'onReply', comment: Comment): void;
  (e: 'onDelete', comment: Comment): void;
  (e: 'onTogglePass', comment: Comment): void;
  (e: 'onChecked', comment: Comment): void;
  (e: 'onUnChecked', comment: Comment): void;
}>();

const globalStore = useGlobalStore();

/**
 * 选择框改变事件
 * @param checked 是否选中
 */
const onCheckboxChecked = (checked: boolean) => {
  if (checked) {
    emit('onChecked', props.comment);
  } else {
    emit('onUnChecked', props.comment);
  }
};
</script>

<template>
  <n-list-item>
    <n-thing class="animate__animated animate__fadeIn">
      <template #avatar>
        <n-checkbox
          :checked="isChecked"
          style="margin-left: -4px; margin-right: 12px"
          @update-checked="onCheckboxChecked"
        />
      </template>
      <template #header>
        <n-space align="center" :size="6" style="flex-wrap: wrap">
          <n-text strong>{{ comment.displayName }}</n-text>
          <n-tag
            size="small"
            round
            :type="comment.isPass ? 'success' : 'warning'"
          >
            {{ comment.isPass ? '已通过' : '待审核' }}
          </n-tag>
          <n-tag
            v-if="comment.parentCommentId !== null"
            size="small"
            round
            type="info"
          >
            子评论
          </n-tag>
          <n-text depth="3" style="font-size: 0.85em">
            {{ formatTimestamp(comment.createTime) }}
          </n-text>
        </n-space>
      </template>
      <template #description>
        <n-space vertical size="small" style="margin-top: -6px">
          <n-text depth="3" style="font-size: 0.85em">
            文章：{{ comment.postTitle ?? `#${comment.postId}` }}
            · {{ comment.email }}
          </n-text>
          <n-text style="white-space: pre-wrap; word-break: break-word">
            {{ comment.content }}
          </n-text>
          <n-space align="center" :size="8" style="flex-wrap: wrap">
            <n-text v-if="comment.replyDisplayName" depth="3">
              回复 @{{ comment.replyDisplayName }}
            </n-text>
            <n-text v-if="comment.parentCommentId !== null" depth="3">
              父评论 #{{ comment.parentCommentId }}
            </n-text>
            <n-button
              v-if="comment.site"
              text
              tag="a"
              type="primary"
              :href="comment.site"
              target="_blank"
              style="font-size: 0.85em"
            >
              {{ comment.site }}
            </n-button>
          </n-space>
        </n-space>
      </template>
      <template #header-extra>
        <n-button-group size="small">
          <n-button
            tertiary
            :type="comment.isPass ? 'warning' : 'success'"
            @click="emit('onTogglePass', comment)"
          >
            <template #icon>
              <n-icon>
                <CancelPassIcon v-if="comment.isPass" />
                <PassIcon v-else />
              </n-icon>
            </template>
            <span v-if="!globalStore.isSmallWindow">
              {{ comment.isPass ? '取消通过' : '通过' }}
            </span>
          </n-button>
          <n-button tertiary type="default" @click="emit('onReply', comment)">
            <template #icon>
              <n-icon>
                <ReplyIcon />
              </n-icon>
            </template>
            <span v-if="!globalStore.isSmallWindow">回复</span>
          </n-button>
          <n-button tertiary type="default" @click="emit('onEdit', comment)">
            <template #icon>
              <n-icon>
                <EditIcon />
              </n-icon>
            </template>
            <span v-if="!globalStore.isSmallWindow">编辑</span>
          </n-button>
          <n-button tertiary type="error" @click="emit('onDelete', comment)">
            <template #icon>
              <n-icon>
                <TrashIcon />
              </n-icon>
            </template>
            <span v-if="!globalStore.isSmallWindow">删除</span>
          </n-button>
        </n-button-group>
      </template>
    </n-thing>
  </n-list-item>
</template>

<style scoped></style>
