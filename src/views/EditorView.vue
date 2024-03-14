<script setup lang="ts">
import { ExposeParam, MdEditor, Themes } from 'md-editor-v3';
import { inject, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import {
  confirmDialog,
  errorMsg,
  optionSuccessMsg,
  successMsg
} from '../utils/Message.ts';
import {
  FormInst,
  NBadge,
  NButton,
  NCard,
  NDropdown,
  NEllipsis,
  NForm,
  NFormItem,
  NIcon,
  NInput,
  NInputGroup,
  NModal,
  NSelect,
  NSpace,
  NSwitch,
  SelectOption
} from 'naive-ui';
import {
  getCurrentTheme,
  isNumber,
  renderIcon
} from '../utils/MyUtils.ts';
import {
  FileTrayFullOutline as DraftIcon,
  HammerOutline as HammerIcon,
  MoonOutline as MoonIcon,
  RepeatOutline as RepeatIcon,
  RocketOutline as PublishIcon,
  SaveOutline as SaveIcon,
  SunnyOutline as SunIcon,
  TrashOutline as TrashIcon
} from '@vicons/ionicons5';
import bus from '../utils/EventBus.ts';
import {
  addPost,
  addPostDraft,
  delPostDraft,
  postById,
  postContents as getPostContents,
  postDraft as getPostDraft,
  postPublish as getPostPublish,
  updatePostDraft,
  updatePostDraft2Publish,
  updatePostDraftName,
  updatePostPublish
} from '../apis/postApi.ts';
import { useRoute } from 'vue-router';
import { PostContent } from '../models/PostContent.ts';
import { PostContentStatus } from '../models/enum/PostContentStatus.ts';
import { PostRequest } from '../models/request/PostRequest.ts';
import { PostStatus } from '../models/enum/PostStatus.ts';
import { PostVisible } from '../models/enum/PostVisible.ts';
import { Post } from '../models/Post.ts';
import { BusEnum } from '../models/enum/BusEnum.ts';
import { StoreEnum } from '../models/enum/StoreEnum.ts';
import MyPostSettingModal from '../components/component/MyPostSettingModal.vue';
import router from '../router';
import { RouterViews } from '../router/RouterViews.ts';

/**
 * 标记编辑器当前是添加 / 编辑文章
 */
enum EditorMode {
  ADD,
  EDIT
}

/**
 * 草稿名表单模式枚举类
 */
enum DraftNameDialogMode {
  /** 重命名草稿模式 **/
  RENAME,
  /** 添加草稿模式 **/
  ADD_DRAFT
}

// 全局响应式变量
const globalVars: GlobalVars = inject('globalVars')!!;

// 编辑器引用
const editorRef = ref<ExposeParam>();

const route = useRoute();

// 编辑器当前模式
const currentMode = ref(EditorMode.ADD);

// 当前主题
const theme = ref<Themes | undefined>('light');

// 当前文章 ID
const currentPostId = ref<number | null>(null);
// 当前文章
const currentPost = ref<Post | null>(null);

// 编辑器内容
const text = ref('');
// 检测编辑器内容变化的定时器 ID
// 如果文本不为空，并且停止变化超过固定秒数就自动保存文章
const timeoutId = ref(0);

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
const postDraftSelectValue = ref<string | undefined | null>();
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
// 文章自动保存间隔选择器选项
const postAutoSaveIntervalSelectOptions = [
  {
    label: '手动保存',
    value: 0
  },
  {
    label: '立即保存',
    value: 500
  },
  {
    label: '3 秒',
    value: 3000
  },
  {
    label: '5 秒',
    value: 5000
  },
  {
    label: '7 秒',
    value: 7000
  },
  {
    label: '10 秒',
    value: 10000
  },
  {
    label: '30 秒',
    value: 30000
  }
];

// 文章草稿选择器值
const postAutoSaveIntervalSelectValue = ref<number | null>();

// 是否显示草稿名模态框
const visibleDraftNameDialog = ref(false);
// 草稿名对话框当前模式
const draftNameDialogMode = ref<DraftNameDialogMode>(
  DraftNameDialogMode.RENAME
);
// 草稿名表单（用于重命名草稿和添加草稿）
const formDraftName = reactive({
  // 文章 ID
  postId: -1,
  // 旧草稿名
  oldName: '',
  // 新草稿名
  newName: ''
});
// 草稿名表单是否正在加载
const isDraftNameDialogLoading = ref(false);
// 草稿名表单引用
const draftNameDialogRef = ref<FormInst | null>(null);

// 是否显示草稿转正文模态框
const visibleDraft2PublishDialog = ref(false);
const formDraft2Publish = reactive({
  // 文章 ID
  postId: -1,
  // 草稿名
  draftName: '',
  // 是否删除原来的正文（默认为 false，如果为 true 就删除原来的正文）
  deleteContent: false,
  // 正文草稿名
  // 如果不删除正文（deleteContent = false）
  // 原先的正文将转为草稿，如果此项留空，将默认使用被转换为正文的旧草稿名。
  contentName: ''
});
// 草稿转正文表单是否正在加载
const isDraft2PublishDialogLoading = ref(false);

// 是否显示文章设置模态框
const visiblePostSetting = ref(false);

onMounted(() => {
  // 读取以前保存的设置
  loadSetting();
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
    // 获取当前文章
    refreshPost();
    // 获取文章正文
    refreshPostPublish();
    // 获取文章的所有草稿，用于填充在草稿选择器中
    refreshPostDrafts();
  }

  // 监听编辑器文本变化，文本停止变化指定时间后自动保存
  watch(text, () => {
    // 如果编辑器文本发生变化，清除之前设置的定时器（如果有）
    if (timeoutId) {
      clearTimeout(timeoutId.value);
    }

    // 设置一个新的定时器，在5秒后检查文本是否仍然保持不变
    timeoutId.value = setTimeout(() => {
      if (
        currentPostContent.value?.content !== text.value &&
        text.value.length > 0 &&
        postAutoSaveIntervalSelectValue.value!! > 0
      ) {
        // 保存文章内容
        postContentSave(text.value, false, false);
      }
    }, postAutoSaveIntervalSelectValue.value ?? 5000);
  });
});

onBeforeUnmount(() => {
  // 退出前保存一下当前编辑内容
  postContentSave(text.value, false, false);
  // 取消监听 beforeunload 事件
  window.removeEventListener('beforeunload', () => {});
});

/**
 * 读取本地保存的设置
 */
const loadSetting = () => {
  // 获取当前设置的主题
  theme.value = getCurrentTheme() as Themes;

  // 获取之前是否设置过文章自动保存时间间隔
  postAutoSaveIntervalSelectValue.value =
    Number(localStorage.getItem(StoreEnum.POST_AUTO_SAVE_INTERVAL) ?? 5000) ||
    5000;
};

/**
 * 获取文章
 */
const refreshPost = () => {
  postById(currentPostId.value!!)
    .then((res) => {
      currentPost.value = res.data as Post;
    })
    .catch((err) => errorMsg(err));
};

/**
 * 获取文章正文
 */
const refreshPostPublish = () => {
  if (currentPostId.value === null) return;
  window.$loadingBar.start();
  getPostPublish(currentPostId.value)
    .then((res) => {
      window.$loadingBar.finish();
      currentPostContent.value = res.data as PostContent;
      text.value = currentPostContent.value?.content ?? '';
      // 设置当前文章编辑器现实的是文章正文
      currentContentStatus.value = PostContentStatus.PUBLISHED;
    })
    .catch((err) => {
      window.$loadingBar.error();
      errorMsg(err);
    });
};

/**
 * 获取文章所有草稿，用于填充在草稿选择器中
 */
const refreshPostDrafts = () => {
  if (currentPostId.value === null) return;
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
  postContentSave(value, true, true);
};

/**
 * 文章内容保存事件
 * 根据当前编辑器显示的内容，进行不同的操作
 * @param value 要保存的内容
 * @param showMsg 是否显示提示信息
 * @param isManual 是否为手动保存
 * @param onSuccess 保存成功后执行的回调函数
 * @param onFail 保存失败后执行的回调函数
 */
const postContentSave = (
  value: string,
  showMsg: boolean = false,
  isManual: boolean = false,
  onSuccess?: (post: Post) => void,
  onFail?: (err: string) => void
) => {
  window.$loadingBar.start();
  if (currentMode.value === EditorMode.EDIT) {
    // 当前是编辑模式
    let postId = currentPostContent.value!!.postId;
    let draftName = currentPostContent.value!!.draftName;
    if (currentContentStatus.value === PostContentStatus.PUBLISHED) {
      // 保存正文内容
      updatePostPublish(postId, value)
        .then(() => {
          if (showMsg) successMsg('文章内容已保存');
          window.$loadingBar.finish();
          onSuccess?.(currentPost.value!!);
          // 更新当前文章内容，用于判断编辑器内容是否修改
          currentPostContent.value = copyPostContent(
            currentPostContent.value!!,
            value
          );
        })
        .catch((err) => {
          window.$loadingBar.error();
          errorMsg('文章内容保存失败：' + err);
          onFail?.(err);
        });
    } else {
      // 保存文章草稿
      updatePostDraft(postId, value, draftName!!)
        .then(() => {
          if (showMsg) successMsg(`草稿 [${draftName}] 内容已保存`);
          currentPostContent.value!!.content = value;
          window.$loadingBar.finish();
          onSuccess?.(currentPost.value!!);
          // 更新当前文章内容，用于判断编辑器内容是否修改
          currentPostContent.value = copyPostContent(
            currentPostContent.value!!,
            value
          );
        })
        .catch((err) => {
          window.$loadingBar.error();
          errorMsg(`草稿 [${draftName}] 保存失败：` + err);
          onFail?.(err);
        });
    }
  } else {
    // 当前是新增文章模式，调用 “保存内容” 按钮点击事件
    if (isManual) {
      onSaveContentClick(onSuccess, onFail);
    } else if (text.value.length > 0) {
      // 不是手动保存，文章只有在有内容时才保存文章
      // 因为用户切换页面也会调用该方法
      // 所以如果用户编辑框内容为空，就不新增文章
      onSaveContentClick(onSuccess, onFail);
    }
  }
};

/**
 * 根据新的文章内容生成新的 PostContent
 * @param oldPostContent 旧的 PostContent
 * @param newContent 新文章内容
 */
const copyPostContent = (
  oldPostContent: PostContent,
  newContent: string
): PostContent => {
  return {
    ...oldPostContent,
    content: newContent
  };
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
 * 文章草稿选择器点击事件
 */
const onPostContentSelectClick = () => {
  // 保存编辑器内容
  postContentSave(text.value, false);
};

/**
 * 文章草稿选择器选择事件
 * @param value
 */
const onPostContentSelect = (value: string | null) => {
  if (value === null) {
    // 当前事件是清空选择器，切换回文章正文
    postDraftSelectValue.value = null;
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
              optionSuccessMsg();
              // 获取文章所有草稿
              refreshPostDrafts();
              // 切换回文章正文
              refreshPostPublish();
              // 清空草稿选择器数据
              postDraftSelectValue.value = null;
            })
            .catch((err) => errorMsg(err));
        }
      );
      break;
    case 'rename':
      // 重命名草稿
      // 设置草稿名表单为重命名模式
      draftNameDialogMode.value = DraftNameDialogMode.RENAME;
      // 首先清空草稿名表单
      clearDraftNameForm();
      // 将草稿数据填入表单
      formDraftName.postId = currentPostContent.value!!.postId;
      formDraftName.oldName = currentPostContent.value!!.draftName!!;
      formDraftName.newName = currentPostContent.value!!.draftName!!;
      // 显示对话框
      visibleDraftNameDialog.value = true;
      break;
    case 'switch':
      // 将草稿转为正文
      // 首先清空草稿转正文表单
      clearDraft2PublishForm();
      // 将草稿数据填入表单
      formDraft2Publish.postId = currentPostContent.value!!.postId;
      formDraft2Publish.draftName = currentPostContent.value!!.draftName!!;
      // 显示对话框
      visibleDraft2PublishDialog.value = true;
      break;
  }
};

/**
 * 清空草稿名表单
 */
const clearDraftNameForm = () => {
  formDraftName.postId = -1;
  formDraftName.oldName = '';
  formDraftName.newName = '';
};

/**
 * 草稿名表单提交事件
 */
const onDraftRenameSubmit = () => {
  // 检查表单是否有错误
  draftNameDialogRef.value
    ?.validate((errors) => {
      if (!errors) {
        // 表单正确
        isDraftNameDialogLoading.value = true;
        if (draftNameDialogMode.value === DraftNameDialogMode.RENAME) {
          // 当前是重命名草稿模式，修改草稿名
          updatePostDraftName(
            formDraftName.postId,
            formDraftName.oldName,
            formDraftName.newName
          )
            .then(() => {
              // 重命名成功
              optionSuccessMsg();
              // 设置文章草稿选择框当前草稿名为新草稿名
              postDraftSelectValue.value = formDraftName.newName;
              // 将当前编辑框显示文章对象的草稿名改为新草稿名
              currentPostContent.value!!.draftName = formDraftName.newName;
              // 重新获取当前文章所有草稿
              refreshPostDrafts();
              // 关闭草稿名表单对话框
              visibleDraftNameDialog.value = false;
              // 停止加载状态
              isDraftNameDialogLoading.value = false;
            })
            .catch((err) => {
              errorMsg(err);
              // 停止加载状态
              isDraftNameDialogLoading.value = false;
            });
        } else {
          // 当前是添加草稿模式，添加草稿
          let draftName = formDraftName.newName;
          addPostDraft(formDraftName.postId, text.value, draftName)
            .then(() => {
              // 刷新文章所有草稿
              refreshPostDrafts();
              successMsg(`草稿 [${draftName}] 已创建`);
              // 关闭对话框
              visibleDraftNameDialog.value = false;
              // 停止加载状态
              isDraftNameDialogLoading.value = false;
            })
            .catch((err) => {
              errorMsg(`草稿创建失败：` + err);
              // 停止加载状态
              isDraftNameDialogLoading.value = false;
            });
        }
      }
    })
    .catch(() => {});
  return false;
};

/**
 * 将文章正文另存为草稿按钮点击事件
 */
const onSaveAsDraftClick = () => {
  // 首先清空草稿名表单
  clearDraftNameForm();
  // 将文章 ID 填入表单
  formDraftName.postId = currentPostId.value!!;
  // 设置当前草稿名表单为添加草稿模式
  draftNameDialogMode.value = DraftNameDialogMode.ADD_DRAFT;
  visibleDraftNameDialog.value = true;
};

/**
 * 清空草稿转正文表单
 */
const clearDraft2PublishForm = () => {
  formDraft2Publish.postId = -1;
  formDraft2Publish.draftName = '';
  formDraft2Publish.deleteContent = false;
  formDraft2Publish.contentName = '';
};

/**
 * 草稿转正文表单提交事件
 */
const onDraft2PublishSubmit = () => {
  // 草稿转正文
  isDraft2PublishDialogLoading.value = true;
  let contentName =
    formDraft2Publish.contentName.length === 0
      ? null
      : formDraft2Publish.contentName;
  updatePostDraft2Publish(
    formDraft2Publish.postId,
    formDraft2Publish.draftName,
    formDraft2Publish.deleteContent,
    contentName
  )
    .then(() => {
      // 操作成功
      optionSuccessMsg();
      isDraft2PublishDialogLoading.value = false;
      // 获取并转为正文模式
      refreshPostPublish();
      // 重新获取当前文章所有草稿
      refreshPostDrafts();
      // 清空草稿选择器数据
      postDraftSelectValue.value = null;
    })
    .catch((err) => {
      // 操作失败
      errorMsg('操作失败：' + err);
      isDraft2PublishDialogLoading.value = false;
    });
};

/**
 * 右上角，发布 / 保存文章按钮点击事件
 */
const onSubmitClick = () => {
  if (currentMode.value === EditorMode.EDIT) {
    // 当前是编辑模式，显示文章设置对话框
    visiblePostSetting.value = true;
  } else {
    // 当前是添加模式
    // 先添加文章，调用右上角保存内容按钮点击事件
    onSaveContentClick(() => {
      // 保存成功，显示文章设置对话框
      visiblePostSetting.value = true;
    });
  }
};

/**
 * 右上角，新增文章时保存内容按钮点击事件
 * @param onSuccess 成功回调
 * @param onFail 失败回调
 */
const onSaveContentClick = (
  onSuccess?: (post: Post) => void,
  onFail?: (err: string) => void
) => {
  window.$loadingBar.start();
  // 创建一个未命名文章
  let postRequest: PostRequest = {
    postId: null,
    title: '未命名文章',
    autoGenerateExcerpt: true,
    excerpt: null,
    slug: new Date().getTime().toString(),
    cover: null,
    allowComment: true,
    pinned: false,
    status: PostStatus.DRAFT,
    visible: PostVisible.VISIBLE,
    encrypted: null,
    password: null,
    categoryId: null,
    tagIds: Array<number>(),
    content: text.value
  };
  // 添加文章
  addPost(postRequest)
    .then((res) => {
      window.$loadingBar.finish();
      // 设置当前文章
      currentPost.value = res.data as Post;
      // 设置当前文章 ID
      currentPostId.value = currentPost.value?.postId;
      onSuccess?.(currentPost.value);
      // 获取文章正文
      refreshPostPublish();
      // 设置当前为编辑模式
      currentMode.value = EditorMode.EDIT;
      successMsg('保存成功');
    })
    .catch((err) => {
      window.$loadingBar.error();
      errorMsg('保存失败：' + err);
      onFail?.(err);
    });
};

/**
 * 文章自动保存间隔选择器数据改变事件
 * @param value
 */
const onPostAutoSaveIntervalSelectUpdate = (value: number) => {
  postAutoSaveIntervalSelectValue.value = value;
  // 将设置保存到本地
  localStorage.setItem(StoreEnum.POST_AUTO_SAVE_INTERVAL, value.toString());
};

/**
 * 文章设置对话框提交事件
 */
const onPostUpdate = () => {
  // 证明文章已经设置完成
  // 跳转文章页面
  router.push(RouterViews.POST.name);
};
</script>

<template>
  <div class="container">
    <my-post-setting-modal
      v-model:show="visiblePostSetting"
      :post="currentPost"
      @on-post-update="onPostUpdate"
    />

    <!-- 草稿改名模态框 -->
    <n-modal
      v-model:show="visibleDraftNameDialog"
      preset="dialog"
      title="草稿设置"
      positive-text="保存"
      negative-text="取消"
      :loading="isDraftNameDialogLoading"
      @positiveClick="onDraftRenameSubmit"
    >
      <template #default>
        <n-form
          class="dialog-form"
          ref="draftNameDialogRef"
          :model="formDraftName"
        >
          <n-form-item
            label="草稿名"
            path="newName"
            :rule="{ required: true, message: '请输入草稿名' }"
          >
            <n-input
              v-model:value="formDraftName.newName"
              placeholder="草稿名"
              maxlength="256"
            />
          </n-form-item>
        </n-form>
      </template>
    </n-modal>

    <!-- 草稿转正文模态框 -->
    <n-modal
      v-model:show="visibleDraft2PublishDialog"
      preset="dialog"
      title="草稿转正文"
      positive-text="保存"
      negative-text="取消"
      :loading="isDraft2PublishDialogLoading"
      @positiveClick="onDraft2PublishSubmit"
    >
      <template #default>
        <n-form class="dialog-form" :model="formDraft2Publish">
          <n-form-item label="待转换草稿名" path="draftName">
            <n-input v-model:value="formDraft2Publish.draftName" readonly />
          </n-form-item>

          <n-form-item label="是否删除原正文" path="deleteContent">
            <n-switch v-model:value="formDraft2Publish.deleteContent" />
          </n-form-item>

          <n-form-item label="正文草稿名" path="contentName">
            <n-input
              v-model:value="formDraft2Publish.contentName"
              placeholder="留空默认使用被转换为正文的旧草稿名"
              :disabled="formDraft2Publish.deleteContent"
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
            <n-badge
              dot
              :type="currentPostContent?.content === text ? 'success' : 'error'"
            />
            <n-ellipsis>
              {{ currentPost?.title }}
            </n-ellipsis>
          </n-space>
        </div>
      </template>
      <template #header-extra>
        <div style="padding: 10px">
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
                @click="onPostContentSelectClick"
                v-model:value="postDraftSelectValue"
                placeholder="选择草稿"
                clearable
              />
              <n-dropdown
                :options="postDraftManagerSelectOptions"
                @select="onPostDraftManagerSelect"
                trigger="click"
                show-arrow
                v-if="currentContentStatus === PostContentStatus.DRAFT"
              >
                <div>
                  <n-button>管理</n-button>
                </div>
              </n-dropdown>
            </n-input-group>

            <n-select
              v-if="!globalVars.isSmallWindow"
              style="min-width: 130px"
              :options="postAutoSaveIntervalSelectOptions"
              :value="postAutoSaveIntervalSelectValue ?? 5000"
              @update:value="onPostAutoSaveIntervalSelectUpdate"
              placeholder="自动保存间隔"
            />

            <n-button
              v-if="currentMode === EditorMode.ADD"
              @click="onSaveContentClick()"
            >
              <template #icon>
                <n-icon>
                  <SaveIcon />
                </n-icon>
              </template>
              <span v-if="!globalVars.isSmallWindow">保存内容</span>
            </n-button>
            <n-button
              v-if="currentMode === EditorMode.EDIT"
              @click="onSaveAsDraftClick"
            >
              <template #icon>
                <n-icon>
                  <DraftIcon />
                </n-icon>
              </template>
              <span v-if="!globalVars.isSmallWindow">另存为草稿</span>
            </n-button>
            <n-button type="primary" @click="onSubmitClick">
              <template #icon>
                <n-icon>
                  <PublishIcon />
                </n-icon>
              </template>
              <span v-if="!globalVars.isSmallWindow"
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
  padding: 10px 10px 10px 15px;
}
</style>
