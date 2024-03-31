<script setup lang="ts">
import {
  NButton,
  NForm,
  NFormItem,
  NIcon,
  NInput,
  NList,
  NModal,
  NScrollbar,
  NSelect,
  NSpace,
  FormInst
} from 'naive-ui';
import MyCard from '../components/component/MyCard.vue';
import { inject, onMounted, reactive, ref } from 'vue';
import { DiarySort } from '../models/enum/DiarySort.ts';
import { Diary } from '../models/Diary.ts';
import { StoreEnum } from '../models/enum/StoreEnum.ts';
import { confirmDialog, errorMsg, successMsg } from '../utils/Message.ts';
import {
  addDiary,
  delDiaries,
  getDiaries,
  updateDiary
} from '../apis/diaryApi.ts';
import { Pager } from '../models/Pager.ts';
import { AddOutline as AddIcon } from '@vicons/ionicons5';
import DiaryListItem from '../components/item/DiaryListItem.vue';
import { DialogFormMode } from '../models/enum/DialogFormMode.ts';

const globalVars: GlobalVars = inject('globalVars')!!;

// 总日常数
const totalDiaries = ref(0);
// 总页数
const totalPages = ref(0);
// 当前页数
const currentPage = ref(1);
// 每页条数
const pageSize = ref(10);
// 日常查询排序方式，默认按照创建时间降序降序
const diarySort = ref<DiarySort | null>(DiarySort.CREATE_TIME_DESC);
// 日常列表
const diaries = ref<Array<Diary> | null>(null);

// 当前选中的日常 ID 数组
const currentSelectDiaryIds = ref(Array<number>());

// 日常对话框引用
const diaryDialogRef = ref<FormInst | null>(null);
// 是否显示添加 / 修改日常对话框
const visibleDiaryDialog = ref(false);
// 日常对话框是否加载中
const isDiaryDialogLoading = ref(false);
// 日常对话框模式，添加或修改
const dialogMode = ref<DialogFormMode>(DialogFormMode.ADD);
// 日常表单
const formDiary: Diary = reactive({
  diaryId: -1,
  content: '',
  // 下面三个字段仅用于满足接口，无其他用处
  html: '',
  createTime: -1,
  lastModifyTime: -1
});

// 日常排序下拉框选项
const diarySortSelectOptions = [
  {
    label: '创建时间降序',
    value: DiarySort.CREATE_TIME_DESC
  },
  {
    label: '创建时间升序',
    value: DiarySort.CREATE_TIME_ASC
  },
  {
    label: '修改时间降序',
    value: DiarySort.MODIFY_TIME_DESC
  },
  {
    label: '修改时间升序',
    value: DiarySort.MODIFY_TIME_ASC
  }
];

onMounted(() => {
  // 读取以前的设置
  loadSettings();
  // 刷新日常
  refreshDiaries();
});

/**
 * 加载设置
 */
const loadSettings = () => {
  // 读取以前是否设置过每页大小
  pageSize.value = Number(
    localStorage.getItem(StoreEnum.DIARY_PAGE_SIZE) ?? 10
  );
};

/**
 * 刷新日常
 */
const refreshDiaries = () => {
  window.$loadingBar.start();
  getDiaries(
    currentPage.value,
    pageSize.value,
    diarySort.value ?? DiarySort.CREATE_TIME_DESC
  )
    .then((res) => {
      window.$loadingBar.finish();
      let pager: Pager<Diary> = res.data;
      currentPage.value = pager.page;
      pageSize.value = pager.size;
      totalDiaries.value = pager.totalData;
      totalPages.value = pager.totalPages;
      diaries.value = pager.data;
    })
    .catch((err) => {
      window.$loadingBar.error();
      errorMsg(`获取日常失败：${err}`);
    });
};

/**
 * 分页组件当前页改变事件
 * @param page 当前页
 */
const onPageUpdate = (page: number) => {
  currentPage.value = page;
  // 刷新日常
  refreshDiaries();
};

/**
 * 分页组件每页大小改变事件
 * @param size 每页大小
 */
const onPageSizeUpdate = (size: number) => {
  pageSize.value = size;
  // 将每页大小存储
  localStorage.setItem(StoreEnum.DIARY_PAGE_SIZE, size.toString());
  // 刷新日常
  refreshDiaries();
};

/**
 * 删除日常事件
 * @param diary 日常
 */
const onDeleteDiary = (diary: Diary) => {
  confirmDialog(`确定要删除当前日常吗？`, () => {
    deleteDiaries([diary.diaryId]);
  });
};

/**
 * 清空日常表单
 */
const clearDiaryForm = () => {
  formDiary.diaryId = -1;
  formDiary.content = '';
  formDiary.html = '';
  formDiary.createTime = -1;
  formDiary.lastModifyTime = -1;
};

/**
 * 编辑日常事件
 * @param diary 日常接口
 */
const onEditDiary = (diary: Diary) => {
  // 先清空表单
  clearDiaryForm();
  // 设置当前是编辑模式
  dialogMode.value = DialogFormMode.EDIT;
  // 将日常数据填入表单
  formDiary.diaryId = diary.diaryId;
  formDiary.content = diary.content;
  // 显示对话框
  visibleDiaryDialog.value = true;
};

/**
 * 日常项选中事件
 * @param diary 日常接口
 */
const onDiaryItemChecked = (diary: Diary) => {
  currentSelectDiaryIds.value.push(diary.diaryId);
};

/**
 * 日常项取消选中事件
 * @param diary 日常接口
 */
const onDiaryItemUnChecked = (diary: Diary) => {
  currentSelectDiaryIds.value = currentSelectDiaryIds.value.filter((id) => {
    return id !== diary.diaryId;
  });
};

/**
 * 日常全选事件
 */
const onDiaryCheckedAll = () => {
  currentSelectDiaryIds.value = [];
  diaries.value?.forEach((diary) => {
    currentSelectDiaryIds.value.push(diary.diaryId);
  });
};

/**
 * 日常取消全选事件
 */
const onDiaryCancelChecked = () => {
  currentSelectDiaryIds.value = [];
};

/**
 * 日常多选删除点击事件
 */
const onDiariesDeleteClick = () => {
  let ids = Array<number>();
  currentSelectDiaryIds.value.forEach((id) => {
    ids.push(id);
  });
  confirmDialog(`确定要删除选择的 ${ids.length} 个日常吗？`, () => {
    deleteDiaries(ids);
  });
};

/**
 * 批量删除日常
 * @param ids 日常 ID 数组
 */
const deleteDiaries = (ids: Array<number>) => {
  delDiaries(ids)
    .then(() => {
      // 删除成功
      successMsg('删除成功');
      // 删除选择的链接
      currentSelectDiaryIds.value = currentSelectDiaryIds.value.filter((id) => {
        return !ids.includes(id);
      });
      // 刷新日常
      refreshDiaries();
    })
    .catch((err) => errorMsg(err));
};

/**
 * 日常对话框提交事件
 */
const onDiaryDialogSubmit = () => {
  // 验证表单
  diaryDialogRef.value?.validate((errors) => {
    if (!errors) {
      isDiaryDialogLoading.value = true;
      if (dialogMode.value == DialogFormMode.ADD) {
        // 添加日常
        addDiary(formDiary.content)
          .then(() => {
            // 添加成功
            successMsg('添加成功');
            // 刷新日常
            refreshDiaries();
            // 关闭对话框
            visibleDiaryDialog.value = false;
            isDiaryDialogLoading.value = false;
          })
          .catch((err) => {
            isDiaryDialogLoading.value = false;
            errorMsg(err);
          });
      } else {
        // 编辑日常
        updateDiary(formDiary.diaryId, formDiary.content)
          .then(() => {
            // 编辑成功
            successMsg('编辑成功');
            // 刷新日常
            refreshDiaries();
            // 关闭对话框
            visibleDiaryDialog.value = false;
            isDiaryDialogLoading.value = false;
          })
          .catch((err) => {
            isDiaryDialogLoading.value = false;
            errorMsg(err);
          });
      }
    }
  });
  return false;
};

/**
 * 添加日常按钮点击事件
 */
const onAddDiaryClick = () => {
  // 清空表单
  clearDiaryForm();
  // 设置当前是添加模式
  dialogMode.value = DialogFormMode.ADD;
  // 显示对话框
  visibleDiaryDialog.value = true;
};
</script>

<template>
  <div class="container">
    <!-- 添加 / 修改日常模态框 -->
    <n-modal
      v-model:show="visibleDiaryDialog"
      preset="dialog"
      :title="dialogMode == DialogFormMode.ADD ? '添加日常' : '编辑日常'"
      :positive-text="dialogMode == DialogFormMode.ADD ? '添加' : '保存'"
      negative-text="取消"
      :loading="isDiaryDialogLoading"
      @positiveClick="onDiaryDialogSubmit"
      @keydown.enter="onDiaryDialogSubmit"
    >
      <template #default>
        <n-scrollbar style="max-height: 65vh; padding-right: 12px">
          <n-form
            ref="diaryDialogRef"
            :model="formDiary"
            style="margin: 0 5px"
          >
            <n-form-item
              path="content"
              :rule="{ required: true, message: '请输入日常内容' }"
            >
              <n-input
                v-model:value="formDiary.content"
                placeholder="请输入日常内容（支持 Markdown）"
                type="textarea"
              />
            </n-form-item>
          </n-form>
        </n-scrollbar>
      </template>
    </n-modal>
    <my-card
      :data-count="totalDiaries"
      :show-empty-status="diaries !== null && diaries.length === 0"
      :current-page="currentPage"
      :page-size="pageSize"
      :page-count="totalPages"
      :current-page-item-count="diaries?.length ?? 0"
      :is-checked="
        currentSelectDiaryIds.length === diaries?.length && diaries.length !== 0
      "
      show-pagination
      show-checkbox
      :show-delete-button="currentSelectDiaryIds.length > 0"
      item-string="日常"
      @on-page-update="onPageUpdate"
      @on-page-size-update="onPageSizeUpdate"
      @on-checked="onDiaryCheckedAll"
      @on-checkbox-cancel="onDiaryCancelChecked"
      @on-delete-button-click="onDiariesDeleteClick"
    >
      <template #header-extra>
        <n-space>
          <n-select
            :options="diarySortSelectOptions"
            v-model:value="diarySort"
            @update:value="refreshDiaries"
            placeholder="排序方式"
            style="width: 130px"
          />
          <n-button type="primary" @click="onAddDiaryClick">
            <template #icon>
              <n-icon>
                <AddIcon />
              </n-icon>
            </template>
            <span v-if="!globalVars.isSmallWindow">添加日常</span>
          </n-button>
        </n-space>
      </template>
      <template #content>
        <!-- 日常列表 -->
        <div>
          <n-list hoverable>
            <diary-list-item
              v-for="diary in diaries"
              :key="diary.diaryId"
              :diary="diary"
              :is-checked="currentSelectDiaryIds.includes(diary.diaryId)"
              @on-delete-diary="onDeleteDiary"
              @on-edit-diary="onEditDiary"
              @on-checked="onDiaryItemChecked"
              @on-un-checked="onDiaryItemUnChecked"
            />
          </n-list>
        </div>
      </template>
    </my-card>
  </div>
</template>

<style scoped></style>
