<!-- 操作记录面板 -->
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import {
  NButton,
  NDatePicker,
  NDropdown,
  NIcon,
  NList,
  NModal,
  NSelect,
  NSpace,
  NText,
  SelectOption
} from 'naive-ui';
import { TrashOutline as TrashIcon } from '@vicons/ionicons5';
import MyCard from './MyCard.vue';
import OperationListItem from '../item/OperationListItem.vue';
import { Operation } from '../../models/Operation.ts';
import { CommentSort } from '../../models/enum/CommentSort.ts';
import { Pager } from '../../models/Pager.ts';
import {
  delAllOperations,
  delOperations,
  delOperationsBefore,
  getOperations
} from '../../apis/operationApi.ts';
import { confirmDialog, errorMsg, successMsg } from '../../utils/Message.ts';
import { StoreKey } from '../../stores/StoreKey.ts';
import { useGlobalStore } from '../../stores/GlobalStore.ts';

const globalStore = useGlobalStore();

// 总操作记录数
const totalOperations = ref(0);
// 总页数
const totalPages = ref(0);
// 当前页数
const currentPage = ref(1);
// 每页条数
const pageSize = ref(10);
// 操作记录列表
const operations = ref<Array<Operation>>([]);
// 操作记录是否已经加载完成
const isLoaded = ref(false);

// 排序方式
const operationSort = ref<CommentSort>(CommentSort.CREATE_TIME_DESC);

// 当前选中的操作记录 ID 数组
const currentSelectOperationIds = ref<Array<number>>([]);

// 清理操作记录模态框是否显示
const visibleCleanupModal = ref(false);
// 清理时间点
const cleanupTime = ref<number | null>(null);
// 清理是否加载中
const isCleanupLoading = ref(false);

// 排序方式下拉框选项
const sortOptions: Array<SelectOption> = [
  {
    label: '创建时间降序',
    value: CommentSort.CREATE_TIME_DESC
  },
  {
    label: '创建时间升序',
    value: CommentSort.CREATE_TIME_ASC
  }
];

// 清理下拉菜单选项
const cleanupOptions: Array<SelectOption> = [
  {
    label: '清理指定日期前',
    key: 'before'
  },
  {
    label: '清空全部操作记录',
    key: 'all'
  }
];

onMounted(() => {
  loadSettings();
  refreshOperations();
});

/**
 * 读取设置
 */
const loadSettings = () => {
  const ps = Number(
    localStorage.getItem(StoreKey.OPERATION_PAGE_SIZE.toString()) ?? 10
  );
  if (isNaN(ps) || ps < 10 || ps > 120) {
    pageSize.value = 10;
  } else {
    pageSize.value = ps;
  }
};

/**
 * 刷新操作记录
 */
const refreshOperations = () => {
  window.$loadingBar.start();
  getOperations(currentPage.value, pageSize.value, operationSort.value)
    .then((res) => {
      window.$loadingBar.finish();
      const pager = res.data as Pager<Operation>;
      currentPage.value = pager.page;
      pageSize.value = pager.size;
      totalOperations.value = pager.totalData;
      totalPages.value = pager.totalPages;
      operations.value = pager.data;
      isLoaded.value = true;
      currentSelectOperationIds.value = [];
    })
    .catch(() => {
      window.$loadingBar.error();
    });
};

/**
 * 排序方式改变事件
 */
const onSortUpdate = () => {
  currentPage.value = 1;
  refreshOperations();
};

/**
 * 分页当前页改变事件
 * @param page 当前页
 */
const onPageUpdate = (page: number) => {
  currentPage.value = page;
  refreshOperations();
};

/**
 * 分页每页大小改变事件
 * @param size 每页大小
 */
const onPageSizeUpdate = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
  localStorage.setItem(StoreKey.OPERATION_PAGE_SIZE.toString(), size.toString());
  refreshOperations();
};

/**
 * 操作记录项选中事件
 * @param operation 操作记录
 */
const onOperationChecked = (operation: Operation) => {
  currentSelectOperationIds.value.push(operation.operationId);
};

/**
 * 操作记录项取消选中事件
 * @param operation 操作记录
 */
const onOperationUnChecked = (operation: Operation) => {
  currentSelectOperationIds.value =
    currentSelectOperationIds.value.filter((id) => {
      return id !== operation.operationId;
    });
};

/**
 * 操作记录全选事件
 */
const onOperationCheckedAll = () => {
  currentSelectOperationIds.value = operations.value.map(
    (operation) => operation.operationId
  );
};

/**
 * 操作记录取消全选事件
 */
const onOperationCancelChecked = () => {
  currentSelectOperationIds.value = [];
};

/**
 * 删除单条操作记录事件
 * @param operation 操作记录
 */
const onDeleteOperation = (operation: Operation) => {
  confirmDialog('确定要删除该操作记录吗？', () => {
    delOperations([operation.operationId])
      .then(() => {
        successMsg('删除成功');
        refreshOperations();
      })
      .catch(() => {});
  });
};

/**
 * 批量删除选中的操作记录事件
 */
const onDeleteSelectedOperations = () => {
  const ids = currentSelectOperationIds.value;
  if (ids.length === 0) {
    return;
  }
  confirmDialog(`确定要删除选择的 ${ids.length} 条操作记录吗？`, () => {
    delOperations(ids)
      .then(() => {
        successMsg('删除成功');
        refreshOperations();
      })
      .catch(() => {});
  });
};

/**
 * 清理操作记录下拉菜单选择事件
 * @param key 菜单项
 */
const onCleanupSelect = (key: string) => {
  if (key === 'all') {
    confirmDialog('确定要清空全部操作记录吗？此操作不可逆。', () => {
      delAllOperations()
        .then(() => {
          successMsg('操作记录已清空');
          refreshOperations();
        })
        .catch(() => {});
    });
    return;
  }
  cleanupTime.value = null;
  visibleCleanupModal.value = true;
};

/**
 * 清理指定日期前的操作记录
 */
const onCleanupBeforeSubmit = () => {
  if (cleanupTime.value === null) {
    errorMsg('请选择日期');
    return false;
  }
  isCleanupLoading.value = true;
  delOperationsBefore(cleanupTime.value)
    .then(() => {
      isCleanupLoading.value = false;
      visibleCleanupModal.value = false;
      successMsg('清理成功');
      refreshOperations();
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
      title="清理操作记录"
      positive-text="清理"
      negative-text="取消"
      :loading="isCleanupLoading"
      @positive-click="onCleanupBeforeSubmit"
      @negative-click="visibleCleanupModal = false"
    >
      <n-space vertical :size="12">
        <n-text depth="3">
          将删除所选日期 00:00 之前的所有操作记录，此操作不可逆。
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
      :data-count="totalOperations"
      :show-empty-status="isLoaded && operations.length === 0"
      :current-page="currentPage"
      :page-size="pageSize"
      :page-count="totalPages"
      :current-page-item-count="operations.length"
      :is-checked="
        currentSelectOperationIds.length === operations.length &&
        operations.length !== 0
      "
      show-pagination
      show-checkbox
      :show-delete-button="currentSelectOperationIds.length > 0"
      item-string="操作记录"
      @on-page-update="onPageUpdate"
      @on-page-size-update="onPageSizeUpdate"
      @on-checked="onOperationCheckedAll"
      @on-checkbox-cancel="onOperationCancelChecked"
      @on-delete-button-click="onDeleteSelectedOperations"
    >
      <template #header-extra>
        <n-space :size="8" style="flex-wrap: wrap; justify-content: flex-end">
          <n-select
            v-model:value="operationSort"
            :options="sortOptions"
            style="width: 130px"
            @update:value="onSortUpdate"
          />

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
        </n-space>
      </template>

      <template #content>
        <n-list hoverable>
          <operation-list-item
            v-for="operation in operations"
            :key="operation.operationId"
            :operation="operation"
            :is-checked="
              currentSelectOperationIds.includes(operation.operationId)
            "
            @on-delete="onDeleteOperation"
            @on-checked="onOperationChecked"
            @on-un-checked="onOperationUnChecked"
          />
        </n-list>
      </template>
    </my-card>
  </div>
</template>

<style scoped></style>
