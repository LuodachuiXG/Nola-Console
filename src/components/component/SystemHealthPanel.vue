<!-- 服务状态面板 -->
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import {
  NAlert,
  NButton,
  NCard,
  NGi,
  NGrid,
  NIcon,
  NSpace,
  NTag,
  NText
} from 'naive-ui';
import { RefreshOutline as RefreshIcon } from '@vicons/ionicons5';
import { Health } from '../../models/Health.ts';
import { getHealth } from '../../apis/healthApi.ts';
import { errorMsg } from '../../utils/Message.ts';
import { formatTimestamp } from '../../utils/MyUtils.ts';
import { useGlobalStore } from '../../stores/GlobalStore.ts';

const globalStore = useGlobalStore();

// 服务健康状态
const health = ref<Health | null>(null);
// 是否加载中
const isLoading = ref(false);
// 最后刷新时间
const lastRefreshTime = ref<number | null>(null);

onMounted(() => {
  refreshHealth();
});

/**
 * 刷新服务健康状态
 */
const refreshHealth = () => {
  isLoading.value = true;
  getHealth()
    .then((data) => {
      health.value = data;
      lastRefreshTime.value = Date.now();
      isLoading.value = false;
    })
    .catch(() => {
      health.value = null;
      isLoading.value = false;
      errorMsg('无法获取服务状态，请检查后端是否运行');
    });
};

// 整体状态标签颜色
const statusTagType = computed<'success' | 'warning' | 'error'>(() => {
  if (!health.value) {
    return 'error';
  }
  return health.value.status === 'UP' ? 'success' : 'warning';
});
</script>

<template>
  <div>
    <n-space vertical :size="12">
      <n-space justify="end" align="center">
        <n-text v-if="lastRefreshTime" depth="3" style="font-size: 0.85em">
          最后刷新：{{ formatTimestamp(lastRefreshTime) }}
        </n-text>
        <n-button :loading="isLoading" @click="refreshHealth">
          <template #icon>
            <n-icon>
              <RefreshIcon />
            </n-icon>
          </template>
          刷新
        </n-button>
      </n-space>

      <n-grid
        :cols="globalStore.isSmallWindow ? 1 : 2"
        :x-gap="12"
        :y-gap="12"
      >
        <n-gi>
          <n-card title="服务整体状态" size="small">
            <n-space align="center" :size="8">
              <n-tag :type="statusTagType" round>
                {{ health?.status ?? '无法获取' }}
              </n-tag>
              <n-text depth="3">
                {{
                  health
                    ? health.status === 'UP'
                      ? '所有依赖可用'
                      : '存在不可用的依赖'
                    : '请检查服务端运行状态'
                }}
              </n-text>
            </n-space>
          </n-card>
        </n-gi>

        <n-gi>
          <n-card title="服务器时间" size="small">
            <n-text>
              {{ health ? formatTimestamp(health.time) : '—' }}
            </n-text>
          </n-card>
        </n-gi>

        <n-gi>
          <n-card title="MySQL" size="small">
            <n-tag
              :type="
                health === null
                  ? 'default'
                  : health.database
                    ? 'success'
                    : 'error'
              "
              round
            >
              {{ health === null ? '未知' : health.database ? '正常' : '异常' }}
            </n-tag>
          </n-card>
        </n-gi>

        <n-gi>
          <n-card title="Redis" size="small">
            <n-tag
              :type="
                health === null ? 'default' : health.redis ? 'success' : 'error'
              "
              round
            >
              {{ health === null ? '未知' : health.redis ? '正常' : '异常' }}
            </n-tag>
          </n-card>
        </n-gi>
      </n-grid>

      <n-alert type="default" :show-icon="false">
        该状态来自公开的 /health 接口，仅反映数据库和 Redis
        的可用性，不包含连接信息。服务降级时接口会返回 503。
      </n-alert>
    </n-space>
  </div>
</template>

<style scoped></style>
