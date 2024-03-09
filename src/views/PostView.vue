<script setup lang="ts">
import {
  FormInst,
  NButton,
  NForm,
  NFormItem,
  NIcon,
  NInput,
  NInputGroup,
  NList,
  NModal,
  NPopover,
  NScrollbar,
  NSelect,
  NSpace,
  NTag,
  NText,
  NDivider,
  NSwitch,
  SelectOption,
  SelectRenderTag
} from 'naive-ui';
import { h, onMounted, onUnmounted, reactive, ref } from 'vue';
import { StoreEnum } from '../models/enum/StoreEnum.ts';
import { Post } from '../models/Post.ts';
import MyCard from '../components/component/MyCard.vue';
import PostListItem from '../components/item/PostListItem.vue';
import {
  posts as getPosts,
  recyclePosts,
  updatePost,
  updatePostStatus
} from '../apis/postApi.ts';
import { PostStatus } from '../models/enum/PostStatus.ts';
import { PostVisible } from '../models/enum/PostVisible.ts';
import { PostSort } from '../models/enum/PostSort.ts';
import { confirmDialog, errorMsg, optionSuccessMsg } from '../utils/Message.ts';
import { Pager } from '../models/Pager.ts';
import {
  displayNameToSlug,
  isCurrentSmallWindow,
  isNumber
} from '../utils/MyUtils.ts';
import {
  AddOutline as AddIcon,
  FileTrayFullOutline as FileIcon,
  FlashOffOutline as FlashOffIcon,
  FlashOutline as FlashIcon,
  TrashOutline as TrashIcon,
  LockOpenOutline as LockOpenIcon,
  RefreshOutline as RefreshIcon,
  SearchOutline as SearchIcon
} from '@vicons/ionicons5';
import { addTag, tags } from '../apis/tagApi.ts';
import { addCategory, categories } from '../apis/categoryApi.ts';
import { Tag } from '../models/Tag.ts';
import { Category } from '../models/Category.ts';
import { TagColor } from 'naive-ui/es/tag/src/common-props';
import MyTag from '../components/component/MyTag.vue';
import { PostRequest } from '../models/PostRequest.ts';

// 总文章数
const totalPosts = ref(0);
// 当前页
const currentPage = ref(1);
// 总页数
const totalPages = ref(0);
// 每页大小
const pageSize = ref(10);
// 文章列表
const posts = ref<Array<Post> | null>(null);

// 标签列表
const tagsList = ref(Array<Tag>());
// 标签选择器列表
const tagsSelectOptions = ref(Array<SelectOption>());
// 分类列表
const categoriesList = ref(Array<Category>());
// 分类选择器列表
const categoriesSelectOptions = ref(Array<SelectOption>());

// 检索文章状态
const queryPostStatus = ref<PostStatus | null>(null);
// 检索文章可见性
const queryPostVisible = ref<PostVisible | null>(null);
// 检索文章关键词
const queryKey = ref<string | null>(null);
// 检索标签 ID
const queryTagId = ref<number | null>(null);
// 检索分类 ID
const queryCategoryId = ref<number | null>(null);
// 检索文章排序
const querySort = ref<PostSort | null>(null);
// 检索文章状态选择器选项
const queryPostStatusSelectOptions = ref<Array<SelectOption>>([
  {
    label: '已发布',
    value: PostStatus.PUBLISHED
  },
  {
    label: '草稿',
    value: PostStatus.DRAFT
  }
]);

// 检索文章可见性选择器选项
const queryPostVisibleSelectOptions: Array<SelectOption> = [
  {
    label: '可见',
    value: PostVisible.VISIBLE
  },
  {
    label: '隐藏',
    value: PostVisible.HIDDEN
  }
];

// 检索文章排序选择器选项
const queryPostSortSelectOptions: Array<SelectOption> = [
  {
    label: '创建时间降序',
    value: PostSort.CREATE_DESC
  },
  {
    label: '创建时间升序',
    value: PostSort.CREATE_ASC
  },
  {
    label: '修改时间降序',
    value: PostSort.MODIFY_DESC
  },
  {
    label: '修改时间升序',
    value: PostSort.MODIFY_ASC
  },
  {
    label: '访问量降序',
    value: PostSort.VISIT_DESC
  },
  {
    label: '访问量升序',
    value: PostSort.VISIT_ASC
  },
  {
    label: '置顶排序',
    value: PostSort.PINNED
  }
];

// 当前是否是小窗口
const isSmallWindow = ref(false);

// 是否显示设置文章对话框
const visibleSettingPostDialog = ref(false);
// 设置文章对话框是否加载中
const isSettingPostDialogLoading = ref(false);
// 设置文章对话框引用
const settingPostDialogRef = ref<FormInst | null>(null);
// 设置文章对话框表单
const formSettingPost: Post = reactive({
  postId: -1,
  title: '',
  autoGenerateExcerpt: false,
  excerpt: '',
  slug: '',
  cover: '',
  allowComment: false,
  pinned: false,
  status: PostStatus.PUBLISHED,
  visible: PostVisible.VISIBLE,
  password: '',
  encrypted: false,
  lastModifyTime: null,
  // 下面几个参数仅用于满足接口要求，不用于表单
  category: null,
  tags: [],
  visit: 0,
  createTime: 0
});
// 设置文章对话框表单，当前文章的标签 ID 数组
const formSettingPostTagIds = ref(Array<number>());
// // 设置文章对话框表单，当前文章的分类 ID
const formSettingPostCategoryId = ref<number>();

onMounted(() => {
  // 读取以前是否设置过每页大小
  pageSize.value = Number(localStorage.getItem(StoreEnum.POST_PAGE_SIZE) ?? 10);

  // 监听窗口大小改变事件
  window.addEventListener('resize', handleWindowSizeChange);
  handleWindowSizeChange();
  // 刷新文章数据
  refreshPosts();
  // 刷新标签和分类数据
  refreshTag();
  refreshCategory();
});

onUnmounted(() => {
  // 移除监听窗口大小改变事件
  window.removeEventListener('resize', handleWindowSizeChange);
});

/**
 * 窗口大小改变事件
 */
const handleWindowSizeChange = () => {
  isSmallWindow.value = isCurrentSmallWindow();
};

/**
 * 刷新文章
 */
const refreshPosts = () => {
  window.$loadingBar.start();
  // 获取文章
  getPosts(
    currentPage.value,
    pageSize.value,
    queryPostStatus.value,
    queryPostVisible.value,
    queryKey.value,
    queryTagId.value,
    queryCategoryId.value,
    querySort.value
  )
    .then((res) => {
      let pager = res.data as Pager<Post>;
      if (pager.data?.length === 0 && pager.totalData !== 0) {
        // 当前页数量为空，并且总分类数不为空
        // 将当前页改为第一页，然后重新获取分类
        currentPage.value = 1;
        refreshPosts();
        return;
      }
      posts.value = pager.data;
      totalPosts.value = pager.totalData;
      totalPages.value = pager.totalPages;
      window.$loadingBar.finish();
    })
    .catch((err) => {
      errorMsg(err);
      window.$loadingBar.error();
    });
};

/**
 * 获取标签
 */
const refreshTag = () => {
  // 获取所有标签
  tags(0, 0)
    .then((res) => {
      tagsList.value = res.data.data;
      // 将标签封装到标签选择器列表中
      tags2SelectOptions(tagsList.value);
    })
    .catch((err) => errorMsg('标签获取失败：' + err));
};

/**
 * 将标签数组封装到标签选择器列表中
 * @param tags 标签数组
 * @param override 是否覆盖原数组，否则将新数据添加到末尾
 */
const tags2SelectOptions = (tags: Array<Tag>, override: boolean = true) => {
  // 将标签封装到标签选择器列表中
  let selectList = Array<SelectOption>();
  tags.forEach((tag) => {
    selectList.push({
      label: tag.displayName,
      value: tag.tagId,
      color: tag.color
    });
  });
  if (override) {
    // 覆盖原数组
    tagsSelectOptions.value = selectList;
  } else {
    // 添加到末尾
    tagsSelectOptions.value.push(...selectList);
  }
};

/**
 * 获取分类
 */
const refreshCategory = () => {
  // 获取所有分类
  categories(0, 0)
    .then((res) => {
      categoriesList.value = res.data.data;
      // 将分类封装到分类选择器列表中
      categories2SelectOptions(categoriesList.value);
    })
    .catch((err) => errorMsg('分类获取失败：' + err));
};

/**
 * 将分类数组封装到分类选择器列表中
 * @param categories 分类数组
 * @param override 是否覆盖原数组，否则将新数据添加到末尾
 */
const categories2SelectOptions = (
  categories: Array<Category>,
  override: boolean = true
) => {
  // 将分类封装到分类选择器列表中
  let selectList = Array<SelectOption>();
  categories.forEach((category) => {
    selectList.push({
      label: category.displayName,
      value: category.categoryId!!
    });
  });
  if (override) {
    // 覆盖原数组
    categoriesSelectOptions.value = selectList;
  } else {
    // 添加到末尾
    categoriesSelectOptions.value.push(...selectList);
  }
};

/**
 * 添加文章按钮点击事件
 */
const onAddPostClick = () => {};

/**
 * 分页组件当前页改变事件
 * @param page 当前页
 */
const onPageUpdate = (page: number) => {
  currentPage.value = page;
  // 刷新文章
  refreshPosts();
};

/**
 * 分页组件每页大小改变事件
 * @param size 每页大小
 */
const onPageSizeUpdate = (size: number) => {
  pageSize.value = size;
  // 将每页大小存储
  localStorage.setItem(StoreEnum.POST_PAGE_SIZE, size.toString());
  // 刷新文章
  refreshPosts();
};

/**
 * 编辑文章按钮点击事件
 * @param post 文章接口
 */
const onEditPost = (post: Post) => {
  console.log(post);
};

/**
 * 清空设置文章对话框表单
 */
const clearFormSettingPost = () => {
  formSettingPost.postId = -1;
  formSettingPost.title = '';
  formSettingPost.autoGenerateExcerpt = false;
  formSettingPost.excerpt = '';
  formSettingPost.slug = '';
  formSettingPost.cover = '';
  formSettingPost.allowComment = true;
  formSettingPost.pinned = false;
  formSettingPost.status = PostStatus.PUBLISHED;
  formSettingPost.visible = PostVisible.VISIBLE;
  formSettingPost.password = '';
  formSettingPost.encrypted = false;
  formSettingPost.lastModifyTime = null;
  formSettingPostCategoryId.value = undefined;
  formSettingPostTagIds.value = Array<number>();
};
/**
 * 设置文章按钮点击事件
 * @param post 文章接口
 */
const onSettingPost = (post: Post) => {
  // 首先清空表单
  clearFormSettingPost();
  // 将当前文章数据填入表单
  formSettingPost.postId = post.postId;
  formSettingPost.title = post.title;
  formSettingPost.autoGenerateExcerpt = post.autoGenerateExcerpt;
  formSettingPost.excerpt = post.excerpt;
  formSettingPost.slug = post.slug;
  formSettingPost.cover = post.cover;
  formSettingPost.allowComment = post.allowComment;
  formSettingPost.pinned = post.pinned;
  formSettingPost.status = post.status;
  formSettingPost.visible = post.visible;
  formSettingPost.password = post.password;
  formSettingPost.encrypted = post.encrypted;
  formSettingPost.lastModifyTime = post.lastModifyTime;

  let tagIds = Array<number>();
  post.tags.forEach((tag) => {
    tagIds.push(tag.tagId!!);
  });
  formSettingPostTagIds.value = tagIds;
  formSettingPostCategoryId.value = post.category?.categoryId;

  // 显示设置文章对话框
  visibleSettingPostDialog.value = true;
};

/**
 * 文章设置对话框自动生成别名按钮点击事件
 */
const onSettingPostGenerateSlugClick = () => {
  if (formSettingPost.title.length === 0) {
    errorMsg('文章标题为空');
    return;
  }
  formSettingPost.slug = displayNameToSlug(formSettingPost.title);
};

/**
 * 文章设置对话框自动生成摘要按钮点击事件
 */
const onSettingPostAutoGenerateExcerptClick = () => {
  formSettingPost.autoGenerateExcerpt = !formSettingPost.autoGenerateExcerpt;
};

/**
 * 文章设置对话框分类选择器改变事件
 * @param value 已存在的分类为分类 ID，如果是不存在（新增分类）则为分类名称 string
 */
const onFormSettingPostCategoryUpdate = (value: number | string | null) => {
  if (value === null) {
    return;
  }

  if (isNumber(value)) {
    // 已存在的分类 ID，写入表单数据
    formSettingPostCategoryId.value = Number(value);
    return;
  }

  // value为 string，新增分类
  addCategory({
    displayName: value as string,
    slug: displayNameToSlug(value as string),
    cover: null,
    unifiedCover: false
  })
    .then((res) => {
      // 添加分类成功
      let newCategory = res.data as Category;
      // 将新增的分类 ID 写入表单数据
      formSettingPostCategoryId.value = newCategory.categoryId;
      // 刷新分类
      refreshCategory();
    })
    .catch((err) => errorMsg('添加分类失败：' + err));
};

/**
 * 文章设置对话框分类选择器搜索事件
 * @param query
 */
const onPostSettingCategorySelectSearch = (query: string) => {
  if (!query.length) {
    // 如果查询关键字为空，则默认显示所有分类
    categories2SelectOptions(categoriesList.value);
    return;
  }

  // 在所有分类中检索关键字
  let queryResult = categoriesList.value.filter((category) => {
    if (category.displayName.toLowerCase().includes(query.toLowerCase()))
      return true;
  });

  if (queryResult.length === 0) {
    // 查询结果为空，添加一个选项到选择题，提示用户是否添加新分类
    categoriesSelectOptions.value = [
      {
        label: `添加 [${query}] 分类`,
        value: query
      }
    ];
    return;
  }
  // 将分类搜索结果填充到分类选择器中
  categories2SelectOptions(queryResult);
};

/**
 * 文章设置对话框标签选择器改变事件
 * @param value 已存在的标签为标签 ID，如果是不存在（新增标签）则为标签名称 string
 */
const onFormSettingPostTagUpdate = (value: Array<number> | Array<string>) => {
  // 如果标签为空，则清空表单数据
  if (value.length === 0) {
    formSettingPostTagIds.value = [];
    return;
  }
  // 封装已经选择的标签的 ID 数组
  let selectedTagIds = Array<number>();
  value.forEach((v) => {
    if (isNumber(v)) {
      // 当前 value 为数字（标签 ID），添加到已选择标签数组
      selectedTagIds.push(Number(v));
    } else {
      // 当前 value 为 string（标签名称），先添加标签
      addTag({
        displayName: v as string,
        slug: displayNameToSlug(v as string),
        color: null
      })
        .then((res) => {
          // 添加标签成功
          let newTag = res.data as Tag;
          // 将新增的标签 ID 添加到已选择标签数组
          formSettingPostTagIds.value.push(newTag.tagId!!);
          // 刷新标签
          refreshTag();
        })
        .catch((err) => errorMsg('添加标签失败：' + err));
    }
  });
  formSettingPostTagIds.value = selectedTagIds;
};

/**
 * 文章设置对话框分类选择器搜索事件
 * @param query
 */
const onPostSettingTagSelectSearch = (query: string) => {
  if (!query.length) {
    // 如果查询关键字为空，则默认显示所有标签
    tags2SelectOptions(tagsList.value);
    return;
  }

  // 在所有标签中检索关键字
  let queryResult = tagsList.value.filter((tag) => {
    if (tag.displayName.toLowerCase().includes(query.toLowerCase()))
      return true;
  });

  if (queryResult.length === 0) {
    // 查询结果为空，添加一个选项到选择题，提示用户是否添加新标签
    tagsSelectOptions.value = [
      {
        label: query,
        value: query,
        // 标记当前是选择器选项是添加标签
        addTag: true
      }
    ];
    return;
  }
  // 将标签搜索结果填充到标签选择器中
  tags2SelectOptions(queryResult);
};

const onPostSettingTagSelectRenderTag: SelectRenderTag = ({
  option,
  handleClose
}) => {
  let tagColor: TagColor = {
    textColor: option.color as string,
    borderColor: option.color as string
  };
  return h(
    NTag,
    {
      closable: true,
      color: tagColor,
      // 标签有颜色才加字体影音 class
      class: option.color ? 'tag-text-shadow' : '',
      themeOverrides: {
        closeIconColor: option.color as string
      },
      onMousedown: (e: FocusEvent) => {
        e.preventDefault();
      },
      onClose: (e: MouseEvent) => {
        e.stopPropagation();
        handleClose();
      }
    },
    { default: () => option.label }
  );
};

const onPostSettingTagSelectRenderLabel = (option: SelectOption) => {
  // 放在标签选项前
  let prefix: string = '';
  // 放在标签选项后
  let suffix: string = '';
  // 当前标签被标记为添加标签
  // 详情看方法：onPostSettingTagSelectSearch
  if (option.addTag) {
    prefix = '添加';
    suffix = '标签';
  }
  // 在要添加的标签前后加上提示文字，即 "添加 '<标签名>' 标签"
  return [
    h(
      NSpace,
      {},
      {
        default: () => [
          prefix.length === 0 ? null : h(NText, {}, { default: () => prefix }),
          h(MyTag, {
            tag: {
              displayName: option.label,
              slug: option.label,
              color: option.color as string
            } as Tag,
            size: 'small',
            pointer: true
          }),
          suffix.length === 0 ? null : h(NText, {}, { default: () => suffix })
        ]
      }
    )
  ];
};

/**
 * 删除文章按钮点击事件
 * @param post 文章接口
 */
const onDeletePost = (post: Post) => {
  confirmDialog(`确定要将文章 [${post.title}] 移入回收站吗？`, () => {
    recyclePosts([post.postId])
      .then(() => {
        optionSuccessMsg();
        // 刷新文章
        refreshPosts();
      })
      .catch((err) => errorMsg(err));
  });
};

/**
 * 更新文章状态
 * @param postId 文章 ID
 * @param status 文章状态
 * @param visible 文章可见性
 * @param pinned 文章是否置顶
 */
const onUpdatePostStatus = (
  postId: number,
  status: PostStatus | null = null,
  visible: PostVisible | null = null,
  pinned: boolean | null = null
) => {
  updatePostStatus(postId, status, visible, pinned)
    .then(() => {
      // 打印提示消息
      optionSuccessMsg();
      // 刷新文章
      refreshPosts();
    })
    .catch((err) => errorMsg(err));
};
/**
 * 文章状态 badge 点击事件
 * @param post 文章接口
 */
const onPostStatusBadgeClick = (post: Post) => {
  if (post.status == PostStatus.PUBLISHED) {
    confirmDialog('当前文章已发布，是否设置为草稿？', () => {
      onUpdatePostStatus(post.postId, PostStatus.DRAFT);
    });
  } else {
    confirmDialog('当前文章为草稿，是否发布？', () => {
      onUpdatePostStatus(post.postId, PostStatus.PUBLISHED);
    });
  }
};

/**
 * 文章可见性 badge 点击事件
 * @param post 文章接口
 */
const onPostVisibleBadgeClick = (post: Post) => {
  if (post.visible == PostVisible.HIDDEN) {
    confirmDialog('当前不可见，是否修改为可见？', () => {
      onUpdatePostStatus(post.postId, null, PostVisible.VISIBLE);
    });
  }
};

/**
 * 文章置顶 badge 点击事件
 * @param post 文章接口
 */
const onPostPinnedBadgeClick = (post: Post) => {
  if (post.pinned) {
    confirmDialog('当前置顶，是否取消置顶？', () => {
      onUpdatePostStatus(post.postId, null, null, false);
    });
  }
};

/**
 * 文章加密 badge 点击事件
 * @param post
 */
const onPostEncryptedBadgeClick = (post: Post) => {
  onSettingPost(post);
};

/**
 * 设置文章对话框提交事件
 */
const onSettingPostDialogSubmit = () => {
  // 验证表单是否有错误
  settingPostDialogRef.value
    ?.validate((errors) => {
      if (!errors) {
        // 表单验证成功
        isSettingPostDialogLoading.value = true;

        // 文章是否有密码（为 true 时需提供 password，为 null 保持不变，为 false 删除密码）
        let encrypted: Boolean | null;
        if (
          (formSettingPost.password === null ||
            formSettingPost.password.length === 0) &&
          formSettingPost.encrypted
        ) {
          // 文章密码为空，并且文章当前加密
          // encrypted 设为 null，代表文章加密状态保持不变
          encrypted = null;
        } else {
          encrypted = !!(
            formSettingPost.password && !formSettingPost.encrypted
          );
        }
        // 封装文章请求类
        let postRequest: PostRequest = {
          postId: formSettingPost.postId,
          title: formSettingPost.title,
          autoGenerateExcerpt: formSettingPost.autoGenerateExcerpt,
          excerpt: formSettingPost.excerpt,
          slug: formSettingPost.slug,
          cover: formSettingPost.cover,
          allowComment: formSettingPost.allowComment,
          pinned: formSettingPost.pinned,
          status: formSettingPost.status,
          visible: formSettingPost.visible,
          encrypted: encrypted,
          password: formSettingPost.password,
          categoryId: formSettingPostCategoryId.value,
          tagIds: formSettingPostTagIds.value
        };

        // 更新文章
        updatePost(postRequest)
          .then(() => {
            optionSuccessMsg();
            onSettingPostDialogClose();
          })
          .catch((err) => {
            isSettingPostDialogLoading.value = false;
            errorMsg(err);
          });
      }
    })
    .catch(() => {});
  return false;
};

/**
 * 设置文章对话框关闭后相关事件
 */
const onSettingPostDialogClose = () => {
  // 设置文章对话框加载状态取消
  isSettingPostDialogLoading.value = false;
  // 取消对话框显示
  visibleSettingPostDialog.value = false;
  // 刷新文章
  refreshPosts();
};

/**
 * 检索文章关键字输入框清除事件
 */
const onPostQueryKeyClear = () => {
  queryKey.value = '';
  refreshPosts();
}

/**
 * 检索文章清除事件
 */
const onPostQueryClear = () => {
  queryPostStatus.value = null;
  queryPostVisible.value = null;
  queryCategoryId.value = null;
  queryTagId.value = null;
  queryKey.value = null;
  querySort.value = null;
  // 刷新文章
  refreshPosts();
}
</script>

<template>
  <div class="container">
    <!-- 设置文章对话框 -->
    <n-modal
      v-model:show="visibleSettingPostDialog"
      preset="dialog"
      title="文章设置"
      positive-text="保存"
      negative-text="取消"
      :loading="isSettingPostDialogLoading"
      @positiveClick="onSettingPostDialogSubmit"
      :close-on-esc="false"
      :mask-closable="false"
    >
      <template #default>
        <div>
          <n-scrollbar style="max-height: 70vh; padding-right: 12px">
            <n-form
              ref="settingPostDialogRef"
              class="dialog-form"
              :model="formSettingPost"
              style="margin: 10px 5px"
            >
              <n-form-item
                label="标题"
                path="title"
                :rule="{ required: true, message: '请输入文章标题' }"
              >
                <n-input
                  v-model:value="formSettingPost.title"
                  placeholder="文章标题"
                  maxlength="256"
                  clearable
                />
              </n-form-item>
              <n-form-item
                label="别名"
                path="slug"
                :rule="{ required: true, message: '请输入文章别名' }"
              >
                <n-input-group>
                  <n-input
                    v-model:value="formSettingPost.slug"
                    placeholder="文章别名"
                    maxlength="256"
                    clearable
                  />
                  <n-popover>
                    <template #trigger>
                      <n-button @click="onSettingPostGenerateSlugClick">
                        <template #icon>
                          <n-icon>
                            <RefreshIcon />
                          </n-icon>
                        </template>
                      </n-button>
                    </template>
                    <span>根据标题自动生成</span>
                  </n-popover>
                </n-input-group>
              </n-form-item>
              <n-form-item label="摘要" path="excerpt">
                <n-input-group>
                  <n-input
                    v-model:value="formSettingPost.excerpt"
                    :placeholder="
                      formSettingPost.autoGenerateExcerpt
                        ? '根据文章内容自动生成'
                        : '文章摘要'
                    "
                    maxlength="512"
                    clearable
                    :disabled="formSettingPost.autoGenerateExcerpt"
                  />
                  <n-popover>
                    <template #trigger>
                      <n-button @click="onSettingPostAutoGenerateExcerptClick">
                        <template #icon>
                          <n-icon>
                            <FlashIcon
                              v-if="formSettingPost.autoGenerateExcerpt"
                            />
                            <FlashOffIcon v-else />
                          </n-icon>
                        </template>
                      </n-button>
                    </template>
                    <span>{{
                      formSettingPost.autoGenerateExcerpt
                        ? '根据文章内容自动生成'
                        : '手动填写'
                    }}</span>
                  </n-popover>
                </n-input-group>
              </n-form-item>

              <n-form-item label="分类" path="category">
                <n-select
                  :options="categoriesSelectOptions"
                  :value="formSettingPostCategoryId"
                  @update:value="onFormSettingPostCategoryUpdate"
                  @search="onPostSettingCategorySelectSearch"
                  @clear="formSettingPostCategoryId = undefined"
                  filterable
                  tag
                  remote
                  clearable
                />
              </n-form-item>

              <n-form-item label="标签" path="tag">
                <n-select
                  :options="tagsSelectOptions"
                  :value="formSettingPostTagIds"
                  @update:value="onFormSettingPostTagUpdate"
                  @search="onPostSettingTagSelectSearch"
                  @clear="formSettingPostTagIds = Array<number>()"
                  :render-tag="onPostSettingTagSelectRenderTag"
                  :render-label="onPostSettingTagSelectRenderLabel"
                  multiple
                  filterable
                  tag
                  remote
                  clearable
                />
              </n-form-item>
              <n-form-item label="封面" path="cover">
                <n-input-group>
                  <n-input
                    v-model:value="formSettingPost.cover"
                    placeholder="文章封面地址"
                    maxlength="256"
                    clearable
                  />
                  <n-popover>
                    <template #trigger>
                      <n-button @click="">
                        <template #icon>
                          <n-icon>
                            <FileIcon />
                          </n-icon>
                        </template>
                      </n-button>
                    </template>
                    <span>查看附件</span>
                  </n-popover>
                </n-input-group>
              </n-form-item>

              <n-divider>
                <n-text depth="3" style="font-size: 0.9em">进阶设置</n-text>
              </n-divider>

              <n-form-item label="密码" path="password">
                <n-input-group>
                  <n-input
                    v-model:value="formSettingPost.password"
                    :placeholder="
                      formSettingPost.encrypted ? '文章已设置密码' : '文章密码'
                    "
                    maxlength="128"
                    clearable
                    type="password"
                    :disabled="formSettingPost.encrypted"
                    show-password-on="mousedown"
                  />
                  <n-popover v-if="formSettingPost.encrypted">
                    <template #trigger>
                      <n-button @click="formSettingPost.encrypted = false">
                        <template #icon>
                          <n-icon>
                            <LockOpenIcon />
                          </n-icon>
                        </template>
                      </n-button>
                    </template>
                    <span>解锁文章</span>
                  </n-popover>
                </n-input-group>
              </n-form-item>

              <n-form-item label="评论" path="allowComment">
                <n-switch v-model:value="formSettingPost.allowComment">
                  <template #checked>
                    <span>允许评论</span>
                  </template>
                  <template #unchecked>
                    <span>禁止评论</span>
                  </template>
                </n-switch>
              </n-form-item>

              <n-form-item label="置顶" path="pinned">
                <n-switch v-model:value="formSettingPost.pinned">
                  <template #checked>
                    <span>置顶文章</span>
                  </template>
                  <template #unchecked>
                    <span>默认文章</span>
                  </template>
                </n-switch>
              </n-form-item>

              <n-form-item label="状态" path="status">
                <n-switch
                  v-model:value="formSettingPost.status"
                  :checked-value="PostStatus.PUBLISHED"
                  :unchecked-value="PostStatus.DRAFT"
                >
                  <template #checked>
                    <span>已发布</span>
                  </template>
                  <template #unchecked>
                    <span>草稿</span>
                  </template>
                </n-switch>
              </n-form-item>

              <n-form-item label="可见性" path="visible">
                <n-switch
                  v-model:value="formSettingPost.visible"
                  :checked-value="PostVisible.VISIBLE"
                  :unchecked-value="PostVisible.HIDDEN"
                >
                  <template #checked>
                    <span>可见</span>
                  </template>
                  <template #unchecked>
                    <span>隐藏</span>
                  </template>
                </n-switch>
              </n-form-item>
            </n-form>
          </n-scrollbar>
        </div>
      </template>
    </n-modal>

    <my-card
      :data-count="totalPosts"
      :show-empty-status="posts !== null && posts.length === 0"
      :current-page="currentPage"
      :page-size="pageSize"
      :page-count="totalPages"
      :current-page-item-count="posts?.length ?? 0"
      show-pagination
      item-string="文章"
      @on-page-update="onPageUpdate"
      @on-page-size-update="onPageSizeUpdate"
    >
      <template #header>
        <n-space>
          <n-input-group>
            <n-select
              style="min-width: 90px"
              :options="queryPostStatusSelectOptions"
              v-model:value="queryPostStatus"
              @update:value="refreshPosts"
              placeholder="状态"
              clearable
            />

            <n-select
              style="min-width: 80px"
              :options="queryPostVisibleSelectOptions"
              v-model:value="queryPostVisible"
              @update:value="refreshPosts"
              placeholder="可见性"
              clearable
            />
          </n-input-group>

          <n-input-group>
            <n-select
              style="min-width: 140px"
              :options="categoriesSelectOptions"
              v-model:value="queryCategoryId"
              placeholder="分类"
              clearable
              @clear="queryCategoryId = null"
              @update:value="refreshPosts"
            />

            <n-select
              style="min-width: 160px"
              :options="tagsSelectOptions"
              v-model:value="queryTagId"
              :render-label="onPostSettingTagSelectRenderLabel"
              clearable
              @clear="queryTagId = null"
              @update:value="refreshPosts"
            />
          </n-input-group>

          <n-input-group>
            <n-popover>
              <template #trigger>
                <n-input
                  v-model:value="queryKey"
                  placeholder="关键字检索"
                  clearable
                  @clear="onPostQueryKeyClear"
                />
              </template>
              <span>标题、别名、摘要、文章内容</span>
            </n-popover>

            <n-button @click="refreshPosts">
              <template #icon>
                <n-icon>
                  <SearchIcon />
                </n-icon>
              </template>
            </n-button>
          </n-input-group>
          <n-select
            style="min-width: 140px"
            :options="queryPostSortSelectOptions"
            v-model:value="querySort"
            placeholder="排序方式"
            clearable
            @clear="querySort = null"
            @update:value="refreshPosts"
          />

          <n-button @click="onPostQueryClear">
            <template #icon>
              <n-icon>
                <TrashIcon />
              </n-icon>
            </template>
          </n-button>
        </n-space>
      </template>
      <template #header-extra>
        <n-button type="primary" @click="onAddPostClick">
          <template #icon>
            <n-icon>
              <AddIcon />
            </n-icon>
          </template>
          <span v-if="!isSmallWindow">添加文章</span>
        </n-button>
      </template>
      <template #content>
        <!-- 文章列表 -->
        <n-list hoverable>
          <post-list-item
            v-for="post in posts"
            :key="post.postId"
            :post="post"
            :is-collapsed="isSmallWindow"
            @on-edit-post="onEditPost"
            @on-setting-post="onSettingPost"
            @on-delete-post="onDeletePost"
            @on-post-status-badge-click="onPostStatusBadgeClick"
            @on-post-visible-badge-click="onPostVisibleBadgeClick"
            @on-post-pinned-badge-click="onPostPinnedBadgeClick"
            @on-post-encrypted-badge-click="onPostEncryptedBadgeClick"
          />
        </n-list>
      </template>
    </my-card>
  </div>
</template>

<style scoped></style>
