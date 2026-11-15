<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import {
  NButton,
  NButtonGroup,
  NForm,
  NFormItem,
  NIcon,
  NInput,
  NInputGroup,
  NList,
  NModal,
  NSelect,
  NSpace,
  NSwitch,
  NText,
  FormInst,
  SelectOption
} from 'naive-ui';
import {
  CheckmarkDoneOutline as PassIcon,
  CloseCircleOutline as CancelPassIcon,
  SearchOutline as SearchIcon
} from '@vicons/ionicons5';
import MyCard from '../components/component/MyCard.vue';
import CommentListItem from '../components/item/CommentListItem.vue';
import { Comment } from '../models/Comment.ts';
import { CommentQuery, addComment, delComments, getComments, setCommentsPass, updateComment } from '../apis/commentApi.ts';
import { CommentSort } from '../models/enum/CommentSort.ts';
import { CommentUpdateRequest } from '../models/request/CommentUpdateRequest.ts';
import { Pager } from '../models/Pager.ts';
import { StoreKey } from '../stores/StoreKey.ts';
import { confirmDialog, successMsg } from '../utils/Message.ts';
import { useGlobalStore } from '../stores/GlobalStore.ts';
import { useUserStore } from '../stores/UserStore.ts';

const globalStore = useGlobalStore();
const userStore = useUserStore();

// 总评论数
const totalComments = ref(0);
// 总页数
const totalPages = ref(0);
// 当前页数
const currentPage = ref(1);
// 每页条数
const pageSize = ref(10);
// 评论列表
const comments = ref<Array<Comment>>([]);
// 评论是否已经加载完成
const isLoaded = ref(false);

// 搜索关键字
const commentKey = ref('');
// 审核状态
const commentStatus = ref<'all' | 'passed' | 'pending'>('all');
// 排序方式
const commentSort = ref<CommentSort>(CommentSort.CREATE_TIME_DESC);

// 当前选中的评论 ID 数组
const currentSelectCommentIds = ref<Array<number>>([]);

// 编辑评论模态框引用
const editFormRef = ref<FormInst | null>(null);
// 是否显示编辑评论模态框
const visibleEditModal = ref(false);
// 编辑评论是否加载中
const isEditLoading = ref(false);
// 编辑评论表单
const formEdit = reactive<CommentUpdateRequest>({
  commentId: -1,
  content: '',
  site: null,
  displayName: '',
  email: '',
  isPass: true
});

// 回复评论模态框引用
const replyFormRef = ref<FormInst | null>(null);
// 是否显示回复评论模态框
const visibleReplyModal = ref(false);
// 回复评论是否加载中
const isReplyLoading = ref(false);
// 当前回复的评论
const replyTarget = ref<Comment | null>(null);
// 回复评论表单
const formReply = reactive({
  content: '',
  site: '',
  displayName: '',
  email: '',
  isPass: true
});

// 审核状态下拉框选项
const commentStatusOptions: Array<SelectOption> = [
  {
    label: '全部状态',
    value: 'all'
  },
  {
    label: '待审核',
    value: 'pending'
  },
  {
    label: '已通过',
    value: 'passed'
  }
];

// 排序方式下拉框选项
const commentSortOptions: Array<SelectOption> = [
  {
    label: '创建时间降序',
    value: CommentSort.CREATE_TIME_DESC
  },
  {
    label: '创建时间升序',
    value: CommentSort.CREATE_TIME_ASC
  }
];

onMounted(() => {
  loadSettings();
  refreshComments();
});

/**
 * 读取设置
 */
const loadSettings = () => {
  const ps = Number(
    localStorage.getItem(StoreKey.COMMENT_PAGE_SIZE.toString()) ?? 10
  );
  if (isNaN(ps) || ps < 10 || ps > 120) {
    pageSize.value = 10;
  } else {
    pageSize.value = ps;
  }
};

/**
 * 刷新评论
 */
const refreshComments = () => {
  window.$loadingBar.start();
  const query: CommentQuery = {
    isPass:
      commentStatus.value === 'all' ? null : commentStatus.value === 'passed',
    key: commentKey.value.trim() || null,
    sort: commentSort.value,
    tree: false
  };
  getComments(currentPage.value, pageSize.value, query)
    .then((res) => {
      window.$loadingBar.finish();
      const pager = res.data as Pager<Comment>;
      currentPage.value = pager.page;
      pageSize.value = pager.size;
      totalComments.value = pager.totalData;
      totalPages.value = pager.totalPages;
      comments.value = pager.data;
      isLoaded.value = true;
      currentSelectCommentIds.value = [];
    })
    .catch(() => {
      window.$loadingBar.error();
    });
};

/**
 * 搜索评论
 */
const onSearch = () => {
  currentPage.value = 1;
  refreshComments();
};

/**
 * 审核状态改变事件
 */
const onStatusUpdate = () => {
  currentPage.value = 1;
  refreshComments();
};

/**
 * 分页当前页改变事件
 * @param page 当前页
 */
const onPageUpdate = (page: number) => {
  currentPage.value = page;
  refreshComments();
};

/**
 * 分页每页大小改变事件
 * @param size 每页大小
 */
const onPageSizeUpdate = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
  localStorage.setItem(StoreKey.COMMENT_PAGE_SIZE.toString(), size.toString());
  refreshComments();
};

/**
 * 评论项选中事件
 * @param comment 评论
 */
const onCommentChecked = (comment: Comment) => {
  currentSelectCommentIds.value.push(comment.commentId);
};

/**
 * 评论项取消选中事件
 * @param comment 评论
 */
const onCommentUnChecked = (comment: Comment) => {
  currentSelectCommentIds.value = currentSelectCommentIds.value.filter((id) => {
    return id !== comment.commentId;
  });
};

/**
 * 评论全选事件
 */
const onCommentCheckedAll = () => {
  currentSelectCommentIds.value = comments.value.map(
    (comment) => comment.commentId
  );
};

/**
 * 评论取消全选事件
 */
const onCommentCancelChecked = () => {
  currentSelectCommentIds.value = [];
};

/**
 * 单条评论切换审核状态事件
 * @param comment 评论
 */
const onTogglePass = (comment: Comment) => {
  const isPass = !comment.isPass;
  setCommentsPass([comment.commentId], isPass)
    .then(() => {
      successMsg(isPass ? '评论已通过审核' : '评论已取消通过');
      refreshComments();
    })
    .catch(() => {});
};

/**
 * 批量设置选中评论审核状态
 * @param isPass 是否通过审核
 */
const onBatchPass = (isPass: boolean) => {
  if (currentSelectCommentIds.value.length === 0) {
    return;
  }
  setCommentsPass(currentSelectCommentIds.value, isPass)
    .then(() => {
      successMsg(isPass ? '选中的评论已通过审核' : '选中的评论已取消通过');
      refreshComments();
    })
    .catch(() => {});
};

/**
 * 删除单条评论事件
 * @param comment 评论
 */
const onDeleteComment = (comment: Comment) => {
  confirmDialog(
    `确定要删除该评论吗？如果是顶层评论，其子评论也会一并删除。`,
    () => {
      delComments([comment.commentId])
        .then(() => {
          successMsg('删除成功');
          refreshComments();
        })
        .catch(() => {});
    }
  );
};

/**
 * 批量删除选中评论事件
 */
const onDeleteSelectedComments = () => {
  const ids = currentSelectCommentIds.value;
  if (ids.length === 0) {
    return;
  }
  confirmDialog(
    `确定要删除选择的 ${ids.length} 条评论吗？顶层评论的子评论也会一并删除。`,
    () => {
      delComments(ids)
        .then(() => {
          successMsg('删除成功');
          refreshComments();
        })
        .catch(() => {});
    }
  );
};

/**
 * 打开编辑评论模态框
 * @param comment 评论
 */
const onEditComment = (comment: Comment) => {
  formEdit.commentId = comment.commentId;
  formEdit.content = comment.content;
  formEdit.site = comment.site;
  formEdit.displayName = comment.displayName;
  formEdit.email = comment.email;
  formEdit.isPass = comment.isPass;
  visibleEditModal.value = true;
};

/**
 * 编辑评论提交事件
 */
const onEditSubmit = () => {
  editFormRef.value
    ?.validate((errors) => {
      if (!errors) {
        isEditLoading.value = true;
        updateComment(formEdit)
          .then(() => {
            isEditLoading.value = false;
            visibleEditModal.value = false;
            successMsg('修改成功');
            refreshComments();
          })
          .catch(() => {
            isEditLoading.value = false;
          });
      }
    })
    .catch(() => {});
  return false;
};

/**
 * 打开回复评论模态框
 * @param comment 评论
 */
const onReplyComment = (comment: Comment) => {
  replyTarget.value = comment;
  formReply.content = '';
  formReply.site = '';
  formReply.displayName = userStore.getUser?.displayName ?? '';
  formReply.email = userStore.getUser?.email ?? '';
  formReply.isPass = true;
  visibleReplyModal.value = true;
};

/**
 * 回复评论提交事件
 */
const onReplySubmit = () => {
  replyFormRef.value
    ?.validate((errors) => {
      if (!errors) {
        const target = replyTarget.value;
        if (!target) {
          return;
        }
        isReplyLoading.value = true;
        addComment({
          postId: target.postId,
          parentCommentId: target.parentCommentId ?? target.commentId,
          replyCommentId:
            target.parentCommentId !== null ? target.commentId : null,
          content: formReply.content,
          site: formReply.site.trim() || null,
          displayName: formReply.displayName,
          email: formReply.email,
          isPass: formReply.isPass
        })
          .then(() => {
            isReplyLoading.value = false;
            visibleReplyModal.value = false;
            successMsg('回复成功');
            refreshComments();
          })
          .catch(() => {
            isReplyLoading.value = false;
          });
      }
    })
    .catch(() => {});
  return false;
};
</script>

<template>
  <div class="container">
    <!-- 编辑评论模态框 -->
    <n-modal
      v-model:show="visibleEditModal"
      preset="dialog"
      title="编辑评论"
      positive-text="保存"
      negative-text="取消"
      :loading="isEditLoading"
      @positive-click="onEditSubmit"
      @negative-click="visibleEditModal = false"
    >
      <template #default>
        <n-form ref="editFormRef" class="dialog-form" :model="formEdit">
          <n-form-item
            path="displayName"
            label="评论人名称"
            :rule="[{ required: true, message: '请输入评论人名称' }]"
          >
            <n-input
              v-model:value="formEdit.displayName"
              placeholder="评论人名称"
              clearable
            />
          </n-form-item>

          <n-form-item
            path="email"
            label="评论人邮箱"
            :rule="[
              { required: true, message: '请输入评论人邮箱' },
              { type: 'email', message: '邮箱格式不正确', trigger: ['blur', 'input'] }
            ]"
          >
            <n-input
              v-model:value="formEdit.email"
              placeholder="评论人邮箱"
              clearable
            />
          </n-form-item>

          <n-form-item path="site" label="评论人站点">
            <n-input
              v-model:value="formEdit.site"
              placeholder="评论人站点，可留空"
              clearable
            />
          </n-form-item>

          <n-form-item
            path="content"
            label="评论内容"
            :rule="[{ required: true, message: '请输入评论内容' }]"
          >
            <n-input
              v-model:value="formEdit.content"
              type="textarea"
              placeholder="评论内容"
              :autosize="{ minRows: 4, maxRows: 10 }"
            />
          </n-form-item>

          <n-form-item path="isPass" label="通过审核">
            <n-switch v-model:value="formEdit.isPass" />
          </n-form-item>
        </n-form>
      </template>
    </n-modal>

    <!-- 回复评论模态框 -->
    <n-modal
      v-model:show="visibleReplyModal"
      preset="dialog"
      title="回复评论"
      positive-text="回复"
      negative-text="取消"
      :loading="isReplyLoading"
      @positive-click="onReplySubmit"
      @negative-click="visibleReplyModal = false"
    >
      <template #default>
        <n-space vertical size="small" style="margin-bottom: 16px">
          <n-text depth="3">
            回复 {{ replyTarget?.displayName }}：
            {{ replyTarget?.content }}
          </n-text>
          <n-text depth="3">
            文章：{{ replyTarget?.postTitle ?? `#${replyTarget?.postId}` }}
          </n-text>
        </n-space>
        <n-form ref="replyFormRef" :model="formReply">
          <n-form-item
            path="displayName"
            label="名称"
            :rule="[{ required: true, message: '请输入名称' }]"
          >
            <n-input
              v-model:value="formReply.displayName"
              placeholder="名称"
              clearable
            />
          </n-form-item>

          <n-form-item
            path="email"
            label="邮箱"
            :rule="[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '邮箱格式不正确', trigger: ['blur', 'input'] }
            ]"
          >
            <n-input
              v-model:value="formReply.email"
              placeholder="邮箱"
              clearable
            />
          </n-form-item>

          <n-form-item path="site" label="站点">
            <n-input
              v-model:value="formReply.site"
              placeholder="站点，可留空"
              clearable
            />
          </n-form-item>

          <n-form-item
            path="content"
            label="回复内容"
            :rule="[{ required: true, message: '请输入回复内容' }]"
          >
            <n-input
              v-model:value="formReply.content"
              type="textarea"
              placeholder="回复内容"
              :autosize="{ minRows: 4, maxRows: 10 }"
            />
          </n-form-item>

          <n-form-item path="isPass" label="通过审核">
            <n-switch v-model:value="formReply.isPass" />
          </n-form-item>
        </n-form>
      </template>
    </n-modal>

    <div class="comment-toolbar">
      <n-input-group class="comment-toolbar-search">
        <n-input
          v-model:value="commentKey"
          placeholder="搜索内容 / 名称 / 邮箱"
          clearable
          @keydown.enter="onSearch"
          @clear="onSearch"
        />
        <n-button @click="onSearch">
          <template #icon>
            <n-icon>
              <SearchIcon />
            </n-icon>
          </template>
        </n-button>
      </n-input-group>

      <n-select
        v-model:value="commentStatus"
        class="comment-toolbar-select"
        :options="commentStatusOptions"
        @update:value="onStatusUpdate"
      />

      <n-select
        v-model:value="commentSort"
        class="comment-toolbar-select"
        :options="commentSortOptions"
        @update:value="onStatusUpdate"
      />
    </div>

    <my-card
      :data-count="totalComments"
      :show-empty-status="isLoaded && comments.length === 0"
      :current-page="currentPage"
      :page-size="pageSize"
      :page-count="totalPages"
      :current-page-item-count="comments.length"
      :is-checked="
        currentSelectCommentIds.length === comments.length &&
        comments.length !== 0
      "
      show-pagination
      show-checkbox
      :show-delete-button="currentSelectCommentIds.length > 0"
      item-string="评论"
      @on-page-update="onPageUpdate"
      @on-page-size-update="onPageSizeUpdate"
      @on-checked="onCommentCheckedAll"
      @on-checkbox-cancel="onCommentCancelChecked"
      @on-delete-button-click="onDeleteSelectedComments"
    >
      <template #header-checkbox-button>
        <n-space v-if="currentSelectCommentIds.length > 0" style="margin-top: 2px">
          <n-button-group size="small">
            <n-button type="success" @click="onBatchPass(true)">
              <template #icon>
                <n-icon>
                  <PassIcon />
                </n-icon>
              </template>
              <span v-if="!globalStore.isSmallWindow">通过</span>
            </n-button>
            <n-button type="warning" @click="onBatchPass(false)">
              <template #icon>
                <n-icon>
                  <CancelPassIcon />
                </n-icon>
              </template>
              <span v-if="!globalStore.isSmallWindow">取消通过</span>
            </n-button>
          </n-button-group>
        </n-space>
      </template>

      <template #content>
        <n-list hoverable>
          <comment-list-item
            v-for="comment in comments"
            :key="comment.commentId"
            :comment="comment"
            :is-checked="currentSelectCommentIds.includes(comment.commentId)"
            @on-edit="onEditComment"
            @on-reply="onReplyComment"
            @on-delete="onDeleteComment"
            @on-toggle-pass="onTogglePass"
            @on-checked="onCommentChecked"
            @on-un-checked="onCommentUnChecked"
          />
        </n-list>
      </template>
    </my-card>
  </div>
</template>

<style scoped>
.comment-toolbar {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
  margin-bottom: 12px;
}

.comment-toolbar-search {
  flex: 1 1 220px;
  max-width: 340px;
}

.comment-toolbar-search :deep(.n-input) {
  min-width: 0;
}

.comment-toolbar-select {
  flex: 0 1 130px;
  min-width: 110px;
}
</style>
