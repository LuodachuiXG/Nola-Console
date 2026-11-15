<!-- 访问日志面板 -->
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import {
  NButton,
  NDatePicker,
  NDropdown,
  NIcon,
  NList,
  NModal,
  NSpace,
  NText,
  SelectOption
} from 'naive-ui';
import { TrashOutline as TrashIcon } from '@vicons/ionicons5';
import MyCard from './MyCard.vue';
import AccessLogListItem from '../item/AccessLogListItem.vue';
import { AccessLog } from '../../models/AccessLog.ts';
import { Pager } from '../../models/Pager.ts';
import {
  delAccessLogs,
  delAccessLogsBefore,
  delAllAccessLogs,
  getAccessLogs
} from '../../apis/accessLogApi.ts';
import { confirmDialog, errorMsg, successMsg } from '../../utils/Message.ts';
import { StoreKey } from '../../stores/StoreKey.ts';
import { useGlobalStore } from '../../stores/GlobalStore.ts';

const globalStore = useGlobalStore();

// 总访问日志数
const totalAccessLogs = ref(0);
// 总页数
const totalPages = ref(0);
// 当前页数
const currentPage = ref(1);
// 每页条数
const pageSize = ref(10);
// 访问日志列表
const accessLogs = ref<Array<AccessLog>>([]);
// 访问日志是否已经加载完成
const isLoaded = ref(false);

// 当前选中的访问日志 ID 数组
const currentSelectAccessLogIds = ref<Array<number>>([]);

// 清理访问日志模态框是否显示
const visibleCleanupModal = ref(false);
// 清理时间点
const cleanupTime = ref<number | null>(null);
// 清理是否加载中
const isCleanupLoading = ref(false);

// 清理下拉菜单选项
const cleanupOptions: Array<SelectOption> = [
  {
    label: '清理指定日期前',
    key: 'before'
  },
  {
    label: '清空全部访问日志',
    key: 'all'
  }
];

onMounted(() => {
  loadSettings();
  refreshAccessLogs();
});

/**
 * 读取设置
 */
const loadSettings = () => {
  const ps = Number(
    localStorage.getItem(StoreKey.ACCESS_LOG_PAGE_SIZE.toString()) ?? 10
  );
  if (isNaN(ps) || ps < 10 || ps > 120) {
    pageSize.value = 10;
  } else {
    pageSize.value = ps;
  }
};

/**
 * 刷新访问日志
 */
const refreshAccessLogs = () => {
  window.$loadingBar.start();
  getAccessLogs(currentPage.value, pageSize.value)
    .then((res) => {
      window.$loadingBar.finish();
      const pager = res.data as Pager<AccessLog>;
      currentPage.value = pager.page;
      pageSize.value = pager.size;
      totalAccessLogs.value = pager.totalData;
      totalPages.value = pager.totalPages;
      accessLogs.value = pager.data;
      isLoaded.value = true;
      currentSelectAccessLogIds.value = [];
    })
    .catch(() => {
      window.$loadingBar.error();
    });
};

/**
 * 分页当前页改变事件
 * @param page 当前页
 */
const onPageUpdate = (page: number) => {
  currentPage.value = page;
  refreshAccessLogs();
};

/**
 * 分页每页大小改变事件
 * @param size 每页大小
 */
const onPageSizeUpdate = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
  localStorage.setItem(
    StoreKey.ACCESS_LOG_PAGE_SIZE.toString(),
    size.toString()
  );
  refreshAccessLogs();
};

/**
 * 访问日志项选中事件
 * @param accessLog 访问日志
 */
const onAccessLogChecked = (accessLog: AccessLog) => {
  currentSelectAccessLogIds.value.push(accessLog.accessLogId);
};

/**
 * 访问日志项取消选中事件
 * @param accessLog 访问日志
 */
const onAccessLogUnChecked = (accessLog: AccessLog) => {
  currentSelectAccessLogIds.value = currentSelectAccessLogIds.value.filter(
    (id) => {
      return id !== accessLog.accessLogId;
    }
  );
};

/**
 * 访问日志全选事件
 */
const onAccessLogCheckedAll = () => {
  currentSelectAccessLogIds.value = accessLogs.value.map(
    (accessLog) => accessLog.accessLogId
  );
};

/**
 * 访问日志取消全选事件
 */
const onAccessLogCancelChecked = () => {
  currentSelectAccessLogIds.value = [];
};

/**
 * 删除单条访问日志事件
 * @param accessLog 访问日志
 */
const onDeleteAccessLog = (accessLog: AccessLog) => {
  confirmDialog('确定要删除该访问日志吗？', () => {
    delAccessLogs([accessLog.accessLogId])
      .then(() => {
        successMsg('删除成功');
        refreshAccessLogs();
      })
      .catch(() => {});
  });
};

/**
 * 批量删除选中的访问日志事件
 */
const onDeleteSelectedAccessLogs = () => {
  const ids = currentSelectAccessLogIds.value;
  if (ids.length === 0) {
    return;
  }
  confirmDialog(`确定要删除选择的 ${ids.length} 条访问日志吗？`, () => {
    delAccessLogs(ids)
      .then(() => {
        successMsg('删除成功');
        refreshAccessLogs();
      })
      .catch(() => {});
  });
};

/**
 * 清理访问日志下拉菜单选择事件
 * @param key 菜单项
 */
const onCleanupSelect = (key: string) => {
  if (key === 'all') {
    confirmDialog('确定要清空全部访问日志吗？此操作不可逆。', () => {
      delAllAccessLogs()
        .then(() => {
          successMsg('访问日志已清空');
          refreshAccessLogs();
        })
        .catch(() => {});
    });
    return;
  }
  cleanupTime.value = null;
  visibleCleanupModal.value = true;
};

/**
 * 清理指定日期前的访问日志
 */
const onCleanupBeforeSubmit = () => {
  if (cleanupTime.value === null) {
    errorMsg('请选择日期');
    return false;
  }
  isCleanupLoading.value = true;
  delAccessLogsBefore(cleanupTime.value)
    .then(() => {
      isCleanupLoading.value = false;
      visibleCleanupModal.value = false;
      successMsg('清理成功');
      refreshAccessLogs();
    })
    .catch(() => {
      isCleanupLoading.value = false;
    });
  return false;
};
</script>

<template>
  <div>
    <n-modal
      v-model:show="visibleCleanupModal"
      preset="dialog"
      title="清理访问日志"
      positive-text="清理"
      negative-text="取消"
      :loading="isCleanupLoading"
      @positive-click="onCleanupBeforeSubmit"
      @negative-click="visibleCleanupModal = false"
    >
      <n-space vertical :size="12">
        <n-text depth="3">
          将删除所选日期 00:00 之前的所有访问日志，此操作不可逆。
        </n-text>
        <n-date-picker
          v-model:value="cleanupTime"
          type="date"
          clearable
          style="width: 100%"
        />
      </n-space>
    </n-modal>

    <my-card
      :data-count="totalAccessLogs"
      :show-empty-status="isLoaded && accessLogs.length === 0"
      :current-page="currentPage"
      :page-size="pageSize"
      :page-count="totalPages"
      :current-page-item-count="accessLogs.length"
      :is-checked="
        currentSelectAccessLogIds.length === accessLogs.length &&
        accessLogs.length !== 0
      "
      show-pagination
      show-checkbox
      :show-delete-button="currentSelectAccessLogIds.length > 0"
      item-string="访问日志"
      @on-page-update="onPageUpdate"
      @on-page-size-update="onPageSizeUpdate"
      @on-checked="onAccessLogCheckedAll"
      @on-checkbox-cancel="onAccessLogCancelChecked"
      @on-delete-button-click="onDeleteSelectedAccessLogs"
    >
      <template #header-extra>
        <n-dropdown
          trigger="click"
          :options="cleanupOptions"
          @select="onCleanupSelect"
        >
          <n-button type="warning" tertiary>
            <template #icon>
              <n-icon>
                <TrashIcon />
              </n-icon>
            </template>
            <span v-if="!globalStore.isSmallWindow">清理</span>
          </n-button>
        </n-dropdown>
      </template>

      <template #content>
        <n-list hoverable>
          <access-log-list-item
            v-for="accessLog in accessLogs"
            :key="accessLog.accessLogId"
            :access-log="accessLog"
            :is-checked="
              currentSelectAccessLogIds.includes(accessLog.accessLogId)
            "
            @on-delete="onDeleteAccessLog"
            @on-checked="onAccessLogChecked"
            @on-un-checked="onAccessLogUnChecked"
          />
        </n-list>
      </template>
    </my-card>
  </div>
</template>

<style scoped></style>
