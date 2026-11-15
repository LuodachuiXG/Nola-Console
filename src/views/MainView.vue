<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import {
  NBadge,
  NCard,
  NDescriptions,
  NDescriptionsItem,
  NDivider,
  NEmpty,
  NGi,
  NGrid,
  NIcon,
  NProgress,
  NSpace,
  NTag,
  NText
} from 'naive-ui';
import {
  AtOutline as LinkIcon,
  BookOutline as PostIcon,
  ChatboxOutline as CommentIcon,
  FileTrayFullOutline as FileIcon,
  LeafOutline as DiaryIcon,
  LibraryOutline as CategoryIcon,
  MenuOutline as MenuIcon,
  PricetagsOutline as TagIcon
} from '@vicons/ionicons5';
import MyNumberAnimation from '../components/component/MyNumberAnimation.vue';
import { Overview } from '../models/Overview.ts';
import {
  getOverview,
  streamOverviewOnline,
  SseHttpError
} from '../apis/overviewApi.ts';
import { formatTimestamp } from '../utils/MyUtils.ts';
import { useGlobalStore } from '../stores/GlobalStore.ts';
import { useUserStore } from '../stores/UserStore.ts';
import { BusEnum } from '../models/enum/BusEnum.ts';
import { errorMsg } from '../utils/Message.ts';
import bus from '../utils/EventBus.ts';

const globalStore = useGlobalStore();
const userStore = useUserStore();

// 概览数据
const overview = ref<Overview | null>(null);
// 概览数据是否加载中
const isLoading = ref(false);

// 在线人数
const onlineCount = ref<number | null>(null);
// SSE 连接状态
const onlineStatus = ref<
  'connecting' | 'online' | 'offline' | 'unauthorized'
>('connecting');

// SSE 取消控制器
let sseAbortController: AbortController | null = null;
// SSE 重连定时器
let sseReconnectTimer: number | null = null;
// 页面是否已经卸载
let isUnmounted = false;

onMounted(() => {
  refreshOverview();
  connectOnline();
});

onUnmounted(() => {
  isUnmounted = true;
  sseAbortController?.abort();
  if (sseReconnectTimer !== null) {
    window.clearTimeout(sseReconnectTimer);
  }
});

/**
 * 刷新概览数据
 */
const refreshOverview = () => {
  window.$loadingBar.start();
  isLoading.value = true;
  getOverview()
    .then((res) => {
      window.$loadingBar.finish();
      isLoading.value = false;
      overview.value = res.data as Overview;
    })
    .catch(() => {
      window.$loadingBar.error();
      isLoading.value = false;
    });
};

/**
 * 连接在线人数 SSE
 */
const connectOnline = async () => {
  if (isUnmounted) {
    return;
  }
  onlineStatus.value = 'connecting';
  sseAbortController = new AbortController();
  try {
    await streamOverviewOnline(sseAbortController.signal, (online) => {
      onlineCount.value = online.count;
      onlineStatus.value = 'online';
    });
    scheduleReconnect();
  } catch (error) {
    if (isUnmounted || (error as Error).name === 'AbortError') {
      return;
    }
    if (error instanceof SseHttpError && error.status === 401) {
      onlineCount.value = null;
      onlineStatus.value = 'unauthorized';
      userStore.logout();
      bus.emit(BusEnum.LOGIN_EXPIRED);
      errorMsg('登录过期');
      return;
    }
    onlineStatus.value = 'offline';
    scheduleReconnect();
  }
};

/**
 * 安排 SSE 重连
 */
const scheduleReconnect = () => {
  if (isUnmounted) {
    return;
  }
  if (onlineStatus.value !== 'connecting') {
    onlineStatus.value = 'offline';
  }
  if (sseReconnectTimer !== null) {
    return;
  }
  sseReconnectTimer = window.setTimeout(() => {
    sseReconnectTimer = null;
    connectOnline();
  }, 5000);
};

// 重新登录成功后恢复 SSE 连接
watch(
  () => userStore.token,
  (token) => {
    if (token && onlineStatus.value === 'unauthorized') {
      connectOnline();
    }
  }
);

// 统计数据卡片
const stats = computed(() => {
  const count = overview.value?.count;
  return [
    { label: '文章', value: count?.post ?? 0, icon: PostIcon },
    { label: '评论', value: count?.comment ?? 0, icon: CommentIcon },
    { label: '标签', value: count?.tag ?? 0, icon: TagIcon },
    { label: '分类', value: count?.category ?? 0, icon: CategoryIcon },
    { label: '日常', value: count?.diary ?? 0, icon: DiaryIcon },
    { label: '附件', value: count?.file ?? 0, icon: FileIcon },
    { label: '链接', value: count?.link ?? 0, icon: LinkIcon },
    { label: '菜单项', value: count?.menu ?? 0, icon: MenuIcon }
  ];
});

// 在线状态徽标颜色
const onlineBadgeType = computed<'success' | 'warning' | 'error'>(() => {
  switch (onlineStatus.value) {
    case 'online':
      return 'success';
    case 'connecting':
      return 'warning';
    default:
      return 'error';
  }
});

// 在线状态文本
const onlineStatusText = computed(() => {
  switch (onlineStatus.value) {
    case 'online':
      return '实时更新中';
    case 'connecting':
      return '正在连接';
    case 'unauthorized':
      return '登录已过期';
    default:
      return '连接已断开，正在重连';
  }
});

// 标签最大文章数量
const maxTagCount = computed(() => {
  const counts = overview.value?.tags.map((tag) => tag.postCount ?? 0) ?? [];
  return Math.max(1, ...counts);
});

// 分类最大文章数量
const maxCategoryCount = computed(() => {
  const counts =
    overview.value?.categories.map((category) => category.postCount ?? 0) ?? [];
  return Math.max(1, ...counts);
});

/**
 * 计算进度条百分比
 * @param count 数量
 * @param max 最大数量
 */
const getPercent = (count: number, max: number) => {
  return Math.round((count / max) * 100);
};
</script>

<template>
  <div class="container">
    <n-grid
      :cols="globalStore.isSmallWindow ? 2 : 4"
      :x-gap="12"
      :y-gap="12"
    >
      <n-gi v-for="stat in stats" :key="stat.label">
        <n-card
          size="small"
          class="animate__animated animate__fadeIn"
        >
          <n-space vertical :size="4">
            <n-space align="center" :size="6">
              <n-icon size="18" :depth="3">
                <component :is="stat.icon" />
              </n-icon>
              <n-text depth="3" style="font-size: 0.85em">
                {{ stat.label }}
              </n-text>
            </n-space>
            <n-text strong style="font-size: 1.6em">
              <my-number-animation :to="stat.value" />
            </n-text>
          </n-space>
        </n-card>
      </n-gi>
    </n-grid>

    <n-grid
      :cols="globalStore.isSmallWindow ? 1 : 2"
      :x-gap="12"
      :y-gap="12"
      style="margin-top: 12px"
    >
      <n-gi>
        <n-card
          title="数据总览"
          size="small"
          class="summary-card animate__animated animate__fadeIn"
        >
          <n-space vertical :size="16">
            <div>
              <n-text depth="3" style="font-size: 0.9em">文章总浏览量</n-text>
              <div class="visit-count">
                <my-number-animation :to="overview?.postVisitCount ?? 0" />
              </div>
            </div>

            <n-divider style="margin: 0" />

            <div v-if="overview?.mostViewedPost">
              <n-text depth="3" style="font-size: 0.9em">
                浏览最多的文章
              </n-text>
              <n-space vertical :size="6" style="margin-top: 6px">
                <n-text strong>{{ overview.mostViewedPost.title }}</n-text>
                <n-space align="center" :size="6" style="flex-wrap: wrap">
                  <n-tag size="small" round>
                    {{ overview.mostViewedPost.visit }} 次浏览
                  </n-tag>
                  <n-tag
                    v-if="overview.mostViewedPost.category"
                    size="small"
                    round
                    type="info"
                  >
                    {{ overview.mostViewedPost.category.displayName }}
                  </n-tag>
                  <n-tag
                    v-for="tag in overview.mostViewedPost.tags"
                    :key="tag.tagId ?? tag.slug"
                    size="small"
                    round
                    :color="
                      tag.color
                        ? { color: tag.color, textColor: '#fff' }
                        : undefined
                    "
                  >
                    {{ tag.displayName }}
                  </n-tag>
                </n-space>
              </n-space>
            </div>
            <n-empty
              v-else
              size="small"
              description="暂无文章浏览数据"
            />
          </n-space>
        </n-card>
      </n-gi>

      <n-gi>
        <n-card
          title="实时状态"
          size="small"
          class="summary-card status-card animate__animated animate__fadeIn"
        >
          <div class="status-card-content">
            <div>
              <n-space align="center" justify="space-between" :size="8">
                <n-space align="center" :size="6">
                  <n-badge dot :type="onlineBadgeType" />
                  <n-text depth="3" style="font-size: 0.9em">
                    当前在线
                  </n-text>
                </n-space>
                <n-text depth="3" style="font-size: 0.85em">
                  {{ onlineStatusText }}
                </n-text>
              </n-space>
              <div class="online-count">{{ onlineCount ?? '—' }}</div>
            </div>

            <n-divider style="margin: 0" />

            <n-descriptions
              :column="1"
              label-placement="left"
              size="small"
              bordered
            >
              <n-descriptions-item label="最近操作">
                {{ overview?.lastOperation ?? '暂无操作记录' }}
              </n-descriptions-item>
              <n-descriptions-item label="最后登录">
                {{
                  overview?.lastLoginDate
                    ? formatTimestamp(overview.lastLoginDate)
                    : '暂无登录记录'
                }}
              </n-descriptions-item>
              <n-descriptions-item label="博客创建">
                {{
                  overview?.createDate
                    ? formatTimestamp(overview.createDate)
                    : '暂无创建时间'
                }}
              </n-descriptions-item>
            </n-descriptions>
          </div>
        </n-card>
      </n-gi>
    </n-grid>

    <n-grid
      :cols="globalStore.isSmallWindow ? 1 : 2"
      :x-gap="12"
      :y-gap="12"
      style="margin-top: 12px"
    >
      <n-gi>
        <n-card
          title="热门标签"
          size="small"
          class="animate__animated animate__fadeIn"
        >
          <n-space
            v-if="overview?.tags.length"
            vertical
            :size="12"
          >
            <div
              v-for="tag in overview.tags"
              :key="tag.tagId ?? tag.slug"
            >
              <n-space
                align="center"
                justify="space-between"
                style="margin-bottom: 4px"
              >
                <n-tag
                  size="small"
                  round
                  :color="
                    tag.color
                      ? { color: tag.color, textColor: '#fff' }
                      : undefined
                  "
                >
                  {{ tag.displayName }}
                </n-tag>
                <n-text depth="3" style="font-size: 0.85em">
                  {{ tag.postCount ?? 0 }} 篇
                </n-text>
              </n-space>
              <n-progress
                type="line"
                :percentage="getPercent(tag.postCount ?? 0, maxTagCount)"
                :show-indicator="false"
                :height="6"
                :color="tag.color ?? undefined"
              />
            </div>
          </n-space>
          <n-empty v-else size="small" description="暂无标签" />
        </n-card>
      </n-gi>

      <n-gi>
        <n-card
          title="热门分类"
          size="small"
          class="animate__animated animate__fadeIn"
        >
          <n-space
            v-if="overview?.categories.length"
            vertical
            :size="12"
          >
            <div
              v-for="category in overview.categories"
              :key="category.categoryId ?? category.slug"
            >
              <n-space
                align="center"
                justify="space-between"
                style="margin-bottom: 4px"
              >
                <n-text>{{ category.displayName }}</n-text>
                <n-text depth="3" style="font-size: 0.85em">
                  {{ category.postCount ?? 0 }} 篇
                </n-text>
              </n-space>
              <n-progress
                type="line"
                :percentage="
                  getPercent(category.postCount ?? 0, maxCategoryCount)
                "
                :show-indicator="false"
                :height="6"
              />
            </div>
          </n-space>
          <n-empty v-else size="small" description="暂无分类" />
        </n-card>
      </n-gi>
    </n-grid>
  </div>
</template>

<style scoped>
.summary-card {
  height: 100%;
}

.visit-count {
  font-size: 2.4em;
  font-weight: bold;
  line-height: 1.2;
  margin-top: 4px;
}

.status-card :deep(.n-card__content) {
  display: flex;
  flex-direction: column;
}

.status-card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 16px;
}

.online-count {
  font-size: 2.4em;
  font-weight: bold;
  line-height: 1.2;
  margin-top: 4px;
}
</style>
