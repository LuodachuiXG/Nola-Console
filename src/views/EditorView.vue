<script setup lang="ts">
import { ExposeParam, MdEditor, Themes } from 'md-editor-v3';
import { onBeforeUnmount, onMounted, onUnmounted, reactive, ref } from 'vue';
import {
  confirmDialog,
  errorMsg,
  successMsg,
  optionSuccessMsg
} from '../utils/Message.ts';
import {
  NButton,
  NCard,
  NIcon,
  NInputGroup,
  NSelect,
  NSpace,
  SelectOption,
  NDropdown,
  FormInst,
  NForm,
  NFormItem,
  NInput,
  NModal
} from 'naive-ui';
import { getCurrentTheme, isNumber, renderIcon } from '../utils/MyUtils.ts';
import {
  FileTrayFullOutline as DraftIcon,
  MoonOutline as MoonIcon,
  RocketOutline as PublishIcon,
  SaveOutline as SaveIcon,
  SunnyOutline as SunIcon,
  TrashOutline as TrashIcon,
  HammerOutline as HammerIcon,
  RepeatOutline as RepeatIcon
} from '@vicons/ionicons5';
import bus, { BusEnum } from '../utils/EventBus.ts';
import {
  delPostDraft,
  postContents as getPostContents,
  postDraft as getPostDraft,
  postPublish as getPostPublish,
  updatePostDraft,
  updatePostDraftName,
  updatePostPublish
} from '../apis/postApi.ts';
import { useRoute } from 'vue-router';
import { PostContent } from '../models/PostContent.ts';
import { PostContentStatus } from '../models/enum/PostContentStatus.ts';

/**
 * 标记编辑器当前是添加 / 编辑文章
 */
enum EditorMode {
  ADD,
  EDIT
}

// 编辑器引用
const editorRef = ref<ExposeParam>();

const route = useRoute();

// 编辑器当前模式
const currentMode = ref(EditorMode.ADD);

// 当前主题
const theme = ref<Themes | undefined>('light');

// 当前文章 ID
const currentPostId = ref<number | undefined>();

// 编辑器内容
const text = ref('');

// 当前编辑器显示的内容
const currentPostContent = ref<PostContent>();

// 当前编辑器显示的是正文还是草稿
const currentContentStatus = ref<PostContentStatus>(
  PostContentStatus.PUBLISHED
);

// 文章内容列表（当前文章的正文和所有草稿）
const postContentList = ref(Array<PostContent>());
// 文章草稿选择器选项
const postDraftSelectOptions = ref(Array<SelectOption>());
// 文章草稿选择器值
const postDraftSelectValue = ref<string | undefined>();
// 文章草稿管理按钮弹出菜单项
const postDraftManagerSelectOptions = [
  {
    label: '删除草稿',
    key: 'delete',
    icon: renderIcon(TrashIcon)
  },
  {
    label: '草稿改名',
    key: 'rename',
    icon: renderIcon(HammerIcon)
  },
  {
    type: 'divider'
  },
  {
    label: '转为正文',
    key: 'switch',
    icon: renderIcon(RepeatIcon)
  }
];

// 是否显示草稿重命名模态框
const visibleDraftRenameDialog = ref(false);
// 草稿重命名表单
const formDraftRename = reactive({
  // 文章 ID
  postId: -1,
  // 旧草稿名
  oldName: '',
  // 新草稿名
  newName: ''
});
// 草稿重命名表单是否正在加载
const isDraftRenameDialogLoading = ref(false);
// 草稿重命名表单引用
const draftRenameDialogRef = ref<FormInst | null>(null);

onMounted(() => {
  // 获取当前设置的主题
  theme.value = getCurrentTheme() as Themes;

  // 监听编辑器屏幕全屏事件
  editorRef.value?.on('pageFullscreen', (status) => {
    // 编辑器全屏就隐藏博客侧边栏
    bus.emit(status ? BusEnum.HIDDEN_SIDER : BusEnum.VISIBLE_SIDER);
  });

  // 监听编辑器浏览器全屏事件
  editorRef.value?.on('fullscreen', (status) => {
    // 编辑器全屏就隐藏博客侧边栏
    bus.emit(status ? BusEnum.HIDDEN_SIDER : BusEnum.VISIBLE_SIDER);
  });

  // 监听 beforeunload 事件
  window.addEventListener('beforeunload', (event) => {
    // 提示用户关闭或刷新浏览器的话当前页内容可能不会保存
    event.preventDefault();
  });

  // 当前页面获取到文章 ID 参数
  let postId = route.query.postId as string | null;
  if (postId !== null && isNumber(postId)) {
    currentPostId.value = Number(postId);
    // 设置当前为编辑模式
    currentMode.value = EditorMode.EDIT;
    // 获取文章正文
    refreshPostPublish();
    // 获取文章的所有草稿，用于填充在草稿选择器中
    refreshPostDrafts();
  }
});

onUnmounted(() => {
  // 退出前保存一下当前编辑内容
  postContentSave(text.value);
});

onBeforeUnmount(() => {
  // 取消监听 beforeunload 事件
  window.removeEventListener('beforeunload', () => {});
});

/**
 * 获取文章正文
 */
const refreshPostPublish = () => {
  if (currentPostId.value === undefined) return;
  getPostPublish(currentPostId.value)
    .then((res) => {
      currentPostContent.value = res.data as PostContent;
      text.value = currentPostContent.value?.content ?? '';
      // 设置当前文章编辑器现实的是文章正文
      currentContentStatus.value = PostContentStatus.PUBLISHED;
    })
    .catch((err) => errorMsg(err));
};

/**
 * 获取文章所有草稿，用于填充在草稿选择器中
 */
const refreshPostDrafts = () => {
  if (currentPostId.value === undefined) return;
  getPostContents(currentPostId.value)
    .then((res) => {
      postContentList.value = res.data as Array<PostContent>;
      // 将文章正文和所有草稿封装到选择器菜单
      postDraftSelectOptions.value = Array<SelectOption>();
      postContentList.value.forEach((postContent) => {
        // 只将草稿加入选择器
        if (postContent.status === PostContentStatus.DRAFT) {
          postDraftSelectOptions.value.push({
            label: postContent.draftName!!,
            value: postContent.draftName!!
          });
        }
      });
    })
    .catch((err) => errorMsg(err));
};

/**
 * 将当前编辑器显示的内容切换到草稿
 * @param draftName 草稿名
 */
const switchToDraft = (draftName: string) => {
  getPostDraft(currentPostId.value!!, draftName)
    .then((res) => {
      currentPostContent.value = res.data as PostContent;
      text.value = currentPostContent.value?.content ?? '';
      // 设置当前文章编辑器显示的是草稿;
      currentContentStatus.value = PostContentStatus.DRAFT;
    })
    .catch((err) => errorMsg(err));
};

/**
 * 编辑器保存事件
 * @param value 原内容
 * @param _html 转换 HTML
 */
const onEditorSave = (value: string, _html: Promise<string>) => {
  postContentSave(value);
};

/**
 * 文章内容保存事件
 * 根据当前编辑器显示的内容，进行不同的操作
 * @param value 要保存的内容
 */
const postContentSave = (value: string) => {
  let postId = currentPostContent.value!!.postId;
  let draftName = currentPostContent.value!!.draftName;
  if (currentContentStatus.value === PostContentStatus.PUBLISHED) {
    // 保存正文内容
    updatePostPublish(postId, value)
      .then(() => {
        successMsg('文章内容已保存');
      })
      .catch((err) => errorMsg('文章内容保存失败：' + err));
  } else {
    // 保存文章草稿
    updatePostDraft(postId, value, draftName!!)
      .then(() => {
        successMsg(`草稿 [${draftName}] 内容已保存`);
      })
      .catch((err) => errorMsg(`草稿 [${draftName}] 保存失败：` + err));
  }
};

/**
 * 主题切换事件
 */
const onSwitchTheme = () => {
  if (theme.value === undefined || theme.value === 'light') {
    // 切换为暗色模式
    theme.value = 'dark';
    bus.emit(BusEnum.THEME_DARK);
  } else {
    // 切换为亮色模式
    theme.value = 'light';
    bus.emit(BusEnum.THEME_LIGHT);
  }
};

/**
 * 文章草稿选择器选择事件
 * @param value
 */
const onPostContentSelect = (value: string | null) => {
  // 切换草稿前先保存一下编辑器内容
  postContentSave(text.value);

  if (value === null) {
    // 当前事件是清空选择器，切换回文章正文
    postDraftSelectValue.value = undefined;
    refreshPostPublish();
    return;
  }

  // 切换编辑器当前显示内容为选定的草稿内容
  switchToDraft(value);
};

/**
 * 文章草稿管理选择事件
 * @param key
 */
const onPostDraftManagerSelect = (key: string) => {
  switch (key) {
    case 'delete':
      // 删除草稿
      confirmDialog(
        `确定要删除草稿 [${currentPostContent.value?.draftName}] 吗？此操作不可逆`,
        () => {
          delPostDraft(currentPostId.value!!, [
            currentPostContent.value?.draftName!!
          ])
            .then(() => {
              // 删除成功
              // 获取文章所有草稿
              refreshPostDrafts();
              // 切换回文章正文
              refreshPostPublish();
            })
            .catch((err) => errorMsg(err));
        }
      );
      break;
    case 'rename':
      // 重命名草稿
      // 首先清空草稿改名表单
      clearDraftRenameForm();
      // 将草稿数据填入表单
      formDraftRename.postId = currentPostContent.value!!.postId;
      formDraftRename.oldName = currentPostContent.value!!.draftName!!;
      formDraftRename.newName = currentPostContent.value!!.draftName!!;
      // 显示对话框
      visibleDraftRenameDialog.value = true;
      break;
    case 'switch':
      // 将草稿转为正文
      break;
  }
};

/**
 * 清空草稿改名表单
 */
const clearDraftRenameForm = () => {
  formDraftRename.postId = -1;
  formDraftRename.oldName = '';
  formDraftRename.newName = '';
};

/**
 * 草稿重命名表单提交事件
 */
const onDraftRenameSubmit = () => {
  // 检查表单是否有错误
  draftRenameDialogRef.value
    ?.validate((errors) => {
      if (!errors) {
        // 表单正确，修改草稿名
        updatePostDraftName(
          formDraftRename.postId,
          formDraftRename.oldName,
          formDraftRename.newName
        )
          .then(() => {
            // 重命名成功
            optionSuccessMsg();
            postDraftSelectValue.value = formDraftRename.newName;
            currentPostContent.value!!.draftName = formDraftRename.newName;
            // 重新获取当前文章所有草稿
            refreshPostDrafts();
            // 关闭重命名表单对话框
            visibleDraftRenameDialog.value = false;
          })
          .catch((err) => errorMsg(err));
      }
    })
    .catch(() => {});
  return false;
};
</script>

<template>
  <div class="container">
    <!-- 草稿改名模态框 -->
    <n-modal
      v-model:show="visibleDraftRenameDialog"
      preset="dialog"
      title="草稿重命名"
      positive-text="保存"
      negative-text="取消"
      :loading="isDraftRenameDialogLoading"
      @positiveClick="onDraftRenameSubmit"
    >
      <template #default>
        <n-form ref="draftRenameDialogRef" :model="formDraftRename">
          <n-form-item
            label="草稿名"
            path="newName"
            :rule="{ required: true, message: '请输入草稿名' }"
          >
            <n-input
              v-model:value="formDraftRename.newName"
              placeholder="草稿名"
              maxlength="256"
            />
          </n-form-item>
        </n-form>
      </template>
    </n-modal>

    <n-card
      class="card animate__animated animate__fadeIn"
      content-style="padding: 0"
      header-style="padding: 0;"
      :bordered="false"
    >
      <template #header>
        <div class="card-header">
          <n-space>
            <n-button circle @click="onSwitchTheme()" secondary>
              <template #icon>
                <n-icon>
                  <SunIcon v-if="theme === undefined || theme === 'light'" />
                  <MoonIcon v-else />
                </n-icon>
              </template>
            </n-button>

            <n-input-group
              v-if="
                currentMode === EditorMode.EDIT &&
                postDraftSelectOptions.length > 0
              "
            >
              <n-select
                style="min-width: 150px"
                :options="postDraftSelectOptions"
                @update:value="onPostContentSelect"
                :value="postDraftSelectValue"
                placeholder="选择草稿"
                clearable
              />
              <n-dropdown
                :options="postDraftManagerSelectOptions"
                @select="onPostDraftManagerSelect"
                trigger="click"
                show-arrow
              >
                <div>
                  <n-button
                    v-if="currentContentStatus === PostContentStatus.DRAFT"
                  >
                    管理
                  </n-button>
                </div>
              </n-dropdown>
            </n-input-group>
          </n-space>
        </div>
      </template>
      <template #header-extra>
        <div style="padding: 10px">
          <n-space>
            <n-button v-if="currentMode === EditorMode.ADD">
              <template #icon>
                <n-icon>
                  <SaveIcon />
                </n-icon>
              </template>
              <span>保存内容</span>
            </n-button>
            <n-button
              v-if="
                currentMode === EditorMode.EDIT &&
                currentContentStatus === PostContentStatus.PUBLISHED
              "
            >
              <template #icon>
                <n-icon>
                  <DraftIcon />
                </n-icon>
              </template>
              <span>另存为草稿</span>
            </n-button>
            <n-button type="primary">
              <template #icon>
                <n-icon>
                  <PublishIcon />
                </n-icon>
              </template>
              <span
                >{{
                  currentMode === EditorMode.ADD ? '发布' : '保存'
                }}文章</span
              >
            </n-button>
          </n-space>
        </div>
      </template>
      <template #default>
        <MdEditor
          ref="editorRef"
          class="editor"
          v-model="text"
          :on-save="onEditorSave"
          :theme="theme"
        />
      </template>
    </n-card>
  </div>
</template>

<style scoped>
.container {
  height: calc(100vh - 20px);
  max-height: calc(100vh - 20px);
}

.editor {
  height: calc(100vh - 76px);
}

.card {
  height: 100%;
}

.card-header {
  padding: 10px;
}
</style>
