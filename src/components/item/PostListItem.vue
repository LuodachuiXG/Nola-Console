<!-- 文章列表项 -->
<script setup lang="ts">
import {
  NBadge,
  NButton,
  NButtonGroup,
  NCol,
  NIcon,
  NListItem,
  NPopover,
  NRow,
  NSpace,
  NText,
  NThing
} from 'naive-ui';
import {
  BrushOutline as EditIcon,
  EyeOffOutline as EyeOffIcon,
  LibraryOutline as CategoryIcon,
  SettingsOutline as SettingIcon,
  TrashOutline as TrashIcon
} from '@vicons/ionicons5';
import { Post } from '../../models/Post.ts';
import { formatTimestamp } from '../../utils/MyUtils.ts';
import MyTag from '../component/MyTag.vue';
import { PostStatus } from '../../models/enum/PostStatus.ts';
import { onMounted, ref } from 'vue';
import bus from '../../utils/EventBus.ts';
import { WindowSizeEnum } from '../../models/enum/WindowSizeEnum.ts';
import { PostVisible } from '../../models/enum/PostVisible.ts';

interface Props {
  /** 文章接口 */
  post: Post;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'onEditPost', post: Post): void;
  (e: 'onSettingPost', post: Post): void;
  (e: 'onDeletePost', post: Post): void;
}>();

// 文章状态 badge 类型
const postStatusBadgeType = ref('success');
// 文章状态提示文字
const postStatusString = ref('已发布');
// 当前是否是大窗口，用于控制一些组件显示效果
const isLargeWindowSize = ref(true);

onMounted(() => {
  switch (props.post.status) {
    case PostStatus.DRAFT:
      postStatusBadgeType.value = 'warning';
      postStatusString.value = '草稿';
      break;
    case PostStatus.DELETED:
      postStatusBadgeType.value = 'danger';
      postStatusString.value = '已删除';
      break;
  }
  // 监听窗口大小变化
  bus.on(WindowSizeEnum.LARGE, () => {
    isLargeWindowSize.value = true;
  });
  bus.on(WindowSizeEnum.SMALL, () => {
    isLargeWindowSize.value = false;
  });
});

/**
 * 编辑文章
 * @param post 文章接口
 */
const onEditPost = (post: Post) => {
  emit('onEditPost', post);
};

/**
 * 设置文章
 * @param post 文章接口
 */
const onSettingPost = (post: Post) => {
  emit('onSettingPost', post);
};

/**
 * 删除文章
 * @param post 文章接口
 */
const onDeletePost = (post: Post) => {
  emit('onDeletePost', post);
};
</script>

<template>
  <n-list-item>
    <n-thing class="animate__animated animate__fadeIn">
      <template #header>
        <n-popover :keep-alive-on-hover="false">
          <template #trigger>
            <n-badge
              class="pointer"
              dot
              :offset="[0, -2]"
              processing
              :type="postStatusBadgeType"
            />
          </template>
          <span>{{ postStatusString }}</span>
        </n-popover>
        <n-text strong style="margin-left: 5px">{{ post.title }}</n-text>
        <n-badge
          class="pointer"
          style="margin-left: 10px"
          :offset="[15, -2]"
          v-if="post.pinned"
          value="置顶"
        />

        <n-popover
          :keep-alive-on-hover="false"
          v-if="post.visible === PostVisible.HIDDEN"
        >
          <template #trigger>
            <span>
              <n-badge
                class="pointer"
                :offset="[15, -2]"
                type="warning"
                style="margin-left: 5px"
              >
                <template #value>
                  <n-icon size="16" :component="EyeOffIcon" />
                </template>
              </n-badge>
            </span>
          </template>
          <span>当前文章不可见</span>
        </n-popover>
      </template>
      <template #description>
        <n-row>
          <n-col :span="16">
            <div v-if="post.category !== null">
              <n-button text size="small">
                <template #icon>
                  <n-icon size="14">
                    <CategoryIcon />
                  </n-icon>
                </template>
                {{ post.category?.displayName }}
              </n-button>
            </div>
            <div v-if="post.tags.length > 0">
              <n-space>
                <my-tag
                  size="small"
                  v-for="tag in post.tags"
                  :tag="tag"
                  pointer
                />
              </n-space>
            </div>
          </n-col>
          <n-col :span="8">
            <div style="display: flex; justify-content: end">
              <n-text depth="3" style="font-size: 0.9em"
                >{{ formatTimestamp(post.createTime) }}
              </n-text>
            </div>
          </n-col>
        </n-row>
      </template>
      <template #header-extra>
        <n-button-group size="small">
          <n-button type="default" tertiary @click="onEditPost(post)">
            <template #icon>
              <n-icon>
                <EditIcon />
              </n-icon>
            </template>
            <span v-if="isLargeWindowSize">编辑</span>
          </n-button>
          <n-button type="default" tertiary @click="onSettingPost(post)">
            <template #icon>
              <n-icon>
                <SettingIcon />
              </n-icon>
            </template>
            <span v-if="isLargeWindowSize">设置</span>
          </n-button>
          <n-button type="error" tertiary @click="onDeletePost(post)">
            <template #icon>
              <n-icon>
                <TrashIcon />
              </n-icon>
            </template>
            <span v-if="isLargeWindowSize">回收</span>
          </n-button>
        </n-button-group>
      </template>
    </n-thing>
  </n-list-item>
</template>

<style scoped></style>
