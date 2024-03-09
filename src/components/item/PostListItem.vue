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
  TrashOutline as TrashIcon,
  LockClosedOutline as LockClosedIcon
} from '@vicons/ionicons5';
import { Post } from '../../models/Post.ts';
import { formatTimestamp } from '../../utils/MyUtils.ts';
import MyTag from '../component/MyTag.vue';
import { PostStatus } from '../../models/enum/PostStatus.ts';
import { onMounted, ref, watch } from 'vue';
import { PostVisible } from '../../models/enum/PostVisible.ts';
import { Tag } from '../../models/Tag.ts';
import { Category } from '../../models/Category.ts';
import router from '../../router';
import { RouterViews } from '../../router/RouterViews.ts';

interface Props {
  /** 文章接口 */
  post: Post;
  /** 是否折叠元素 **/
  isCollapsed?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'onEditPost', post: Post): void;
  (e: 'onSettingPost', post: Post): void;
  (e: 'onDeletePost', post: Post): void;
  (e: 'onPostStatusBadgeClick', post: Post): void;
  (e: 'onPostPinnedBadgeClick', post: Post): void;
  (e: 'onPostVisibleBadgeClick', post: Post): void;
  (e: 'onPostEncryptedBadgeClick', post: Post): void;
}>();

// 文章状态 badge 类型
const postStatusBadgeType = ref<
  'default' | 'error' | 'info' | 'success' | 'warning'
>('success');
// 文章状态提示文字
const postStatusString = ref('已发布');

onMounted(() => {
  refreshPostStatusBadge(props.post.status);
  // 监听文章状态变化
  watch(
    () => props.post.status,
    (status) => refreshPostStatusBadge(status)
  );
});

/**
 * 刷新文章状态 badge
 */
const refreshPostStatusBadge = (status: PostStatus) => {
  switch (status) {
    case PostStatus.PUBLISHED:
      postStatusBadgeType.value = 'success';
      postStatusString.value = '已发布';
      break;
    case PostStatus.DRAFT:
      postStatusBadgeType.value = 'warning';
      postStatusString.value = '草稿';
      break;
    case PostStatus.DELETED:
      postStatusBadgeType.value = 'error';
      postStatusString.value = '已删除';
      break;
  }
};

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

/**
 * 标签点击事件
 * @param tag 标签接口
 */
const onTagClick = (tag: Tag) => {
  // 跳转到标签页
  router.push({
    name: RouterViews.TAG.name,
    query: {
      tagId: tag.tagId
    }
  });
};

/**
 * 分类点击事件
 * @param category 分类接口
 */
const onCategoryClick = (category: Category) => {
  // 跳转到分类页
  router.push({
    name: RouterViews.CATEGORY.name,
    query: {
      categoryId: category.categoryId
    }
  });
};

/**
 * 文章状态 badge 点击事件
 */
const onPostStatusBadgeClick = () => {
  emit('onPostStatusBadgeClick', props.post);
};

/**
 * 文章可见性 badge 点击事件
 */
const onPostVisibleBadgeClick = () => {
  emit('onPostVisibleBadgeClick', props.post);
};

/**
 * 文章置顶 badge 点击事件
 */
const onPostPinnedBadgeClick = () => {
  emit('onPostPinnedBadgeClick', props.post);
};

/**
 * 文章加密 badge 点击事件
 */
const onPostEncryptedBadgeClick = () => {
  emit('onPostEncryptedBadgeClick', props.post);
}
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
              @click="onPostStatusBadgeClick"
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
          @click="onPostPinnedBadgeClick"
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
                @click="onPostVisibleBadgeClick"
              >
                <template #value>
                  <n-icon size="16" :component="EyeOffIcon" />
                </template>
              </n-badge>
            </span>
          </template>
          <span>当前文章不可见</span>
        </n-popover>

        <n-popover
          :keep-alive-on-hover="false"
          v-if="post.encrypted"
        >
          <template #trigger>
            <span>
              <n-badge
                class="pointer"
                :offset="[15, -2]"
                type="warning"
                style="margin-left: 5px"
                @click="onPostEncryptedBadgeClick"
              >
                <template #value>
                  <n-icon size="14" :component="LockClosedIcon" />
                </template>
              </n-badge>
            </span>
          </template>
          <span>文章已加密</span>
        </n-popover>
      </template>
      <template #description>
        <n-row style="margin-left: 13px">
          <n-col :span="16">
            <div style="font-size: 0.9em">
              <n-text depth="3">浏览量：{{ post.visit }}</n-text>
              <n-text depth="3" style="margin-left: 10px"
                >{{ post.allowComment ? '允许评论' : '禁止评论' }}
              </n-text>
            </div>
            <div v-if="post.category !== null">
              <n-button
                text
                size="small"
                style="font-size: 0.9em"
                @click="onCategoryClick(post.category)"
              >
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
                  @click="onTagClick(tag)"
                  pointer
                />
              </n-space>
            </div>
          </n-col>
          <n-col :span="8">
            <div class="post-time-div">
              <n-text
                class="post-time-div-text"
                depth="3"
                style="font-size: 0.9em"
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
            <span v-if="!isCollapsed">编辑</span>
          </n-button>
          <n-button type="default" tertiary @click="onSettingPost(post)">
            <template #icon>
              <n-icon>
                <SettingIcon />
              </n-icon>
            </template>
            <span v-if="!isCollapsed">设置</span>
          </n-button>
          <n-button type="error" tertiary @click="onDeletePost(post)">
            <template #icon>
              <n-icon>
                <TrashIcon />
              </n-icon>
            </template>
            <span v-if="!isCollapsed">回收</span>
          </n-button>
        </n-button-group>
      </template>
    </n-thing>
  </n-list-item>
</template>

<style scoped>
.post-time-div {
  position: relative;
  height: 100%;
}

.post-time-div-text {
  position: absolute;
  right: 13px;
  bottom: 0;
}
</style>
