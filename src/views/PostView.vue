<script setup lang="ts">
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
  SelectOption
} from 'naive-ui';
import { h, onMounted, ref } from 'vue';
import { StoreKey } from '../stores/StoreKey.ts';
import { Post } from '../models/Post.ts';
import MyCard from '../components/component/MyCard.vue';
import PostListItem from '../components/item/PostListItem.vue';
import {
  delPost,
  posts as getPosts,
  recyclePosts,
  restorePosts,
  updatePostStatus
} from '../apis/postApi.ts';
import { PostStatus } from '../models/enum/PostStatus.ts';
import { PostVisible } from '../models/enum/PostVisible.ts';
import { PostSort } from '../models/enum/PostSort.ts';
import {
  confirmDialog,
  optionSuccessMsg,
  successMsg
} from '../utils/Message.ts';
import { Pager } from '../models/Pager.ts';
import {
  AddOutline as AddIcon,
  FunnelOutline as FunnelIcon,
  RefreshOutline as RefreshIcon,
  SearchOutline as SearchIcon,
  TrashOutline as TrashIcon,
  RocketOutline as PublishIcon,
  FileTrayFullOutline as DraftIcon
} from '@vicons/ionicons5';
import router from '../router';
import { RouterViews } from '../router/RouterViews.ts';
import MyTag from '../components/component/MyTag.vue';
import { Tag } from '../models/Tag.ts';
import { tags } from '../apis/tagApi.ts';
import { categories } from '../apis/categoryApi.ts';
import { Category } from '../models/Category.ts';
import MyPostSettingModal from '../components/component/MyPostSettingModal.vue';
import { useRoute } from 'vue-router';
import { useGlobalStore } from '../stores/GlobalStore.ts';

// 全局响应式变量
const globalStore = useGlobalStore();

const route = useRoute();

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

// 是否显示筛选条件模态框
const visibleQueryModal = ref(false);
// 检索文章状态
const queryPostStatus = ref<PostStatus | null>(null);
// 检索文章可见性
const queryPostVisible = ref<PostVisible | null>(null);
// 检索文章关键词输入框
const queryKeyInput = ref('');
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
  },
  {
    label: '回收站',
    value: PostStatus.DELETED
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

// 分类选择器列表
const categoriesSelectOptions = ref(Array<SelectOption>());
// 标签选择器列表
const tagsSelectOptions = ref(Array<SelectOption>());
// 标签列表
const tagsList = ref(Array<Tag>());
// 分类列表
const categoriesList = ref(Array<Category>());

// 当前点击的文章
const currentClickPost = ref<Post | null>(null);

// 是否显示设置文章对话框
const visibleSettingPostDialog = ref(false);

// 当前选择的文章 ID
const currentSelectedPostIds = ref(Array<number>());

onMounted(() => {
  // 读取设置
  loadSettings();

  // 查看路由是否传参分类
  let categoryId = Number(route.query.categoryId);
  if (!isNaN(categoryId)) {
    queryCategoryId.value = categoryId;
  }

  // 查看路由是否传参标签
  let tagId = Number(route.query.tagId);
  if (!isNaN(tagId)) {
    queryTagId.value = tagId;
  }

  // 刷新文章数据
  refreshPosts();
  // 刷新标签和分类
  refreshTag();
  refreshCategory();
});

/**
 * 读取设置
 */
const loadSettings = () => {
  // 读取以前是否设置过每页大小
  let ps = Number(
    localStorage.getItem(StoreKey.POST_PAGE_SIZE.toString()) ?? 10
  );
  if (isNaN(ps) || ps < 10 || ps > 120) {
    pageSize.value = 10;
  } else {
    pageSize.value = ps;
  }
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
    .catch(() => {});
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
    .catch(() => {});
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
 * 刷新文章
 */
const refreshPosts = () => {
  window.$loadingBar.start();
  // 刷新文章前清空选择的文章列表
  currentSelectedPostIds.value = [];
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
    .catch(() => {
      window.$loadingBar.error();
    });
};

/**
 * 渲染标签选择器选项
 * 将一个标签描述渲染成一个彩色的自定义标签组件
 * @param option
 */
const onTagSelectRenderLabel = (option: SelectOption) => {
  return h(MyTag, {
    tag: {
      displayName: option.label,
      slug: option.label,
      color: option.color as string
    } as Tag,
    size: 'small',
    pointer: true
  });
};

/**
 * 添加文章按钮点击事件
 */
const onAddPostClick = () => {
  router.push(RouterViews.EDITOR.name);
};

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
  localStorage.setItem(StoreKey.POST_PAGE_SIZE.toString(), size.toString());
  // 刷新文章
  refreshPosts();
};

/**
 * 编辑文章按钮点击事件
 * @param post 文章接口
 */
const onEditPost = (post: Post) => {
  router.push({
    name: RouterViews.EDITOR.name,
    query: {
      postId: post.postId
    }
  });
};

/**
 * 设置文章按钮点击事件
 * @param post 文章接口
 */
const onSettingPost = (post: Post) => {
  // 设置当前点击的文章
  currentClickPost.value = post;
  // 显示设置文章对话框
  visibleSettingPostDialog.value = true;
};

/**
 * 删除文章按钮点击事件
 * @param post 文章接口
 */
const onDeletePost = (post: Post) => {
  if (post.status === PostStatus.DELETED) {
    // 永久删除文章
    confirmDialog(
      `确定要 永久删除 文章 [${post.title}] 吗？此操作不可逆`,
      () => {
        deletePost([post.postId]);
      }
    );
  } else {
    // 回收文章
    confirmDialog(`确定要将文章 [${post.title}] 移入回收站吗？`, () => {
      recyclePost([post.postId]);
    });
  }
};

/**
 * 根据文章 ID 删除文章
 * @param ids 文章 ID 数组
 */
const deletePost = (ids: Array<number>) => {
  delPost(ids)
    .then(() => {
      // 清空选中文章
      currentSelectedPostIds.value = [];
      // 删除成功
      successMsg('删除成功');
      // 刷新文章
      refreshPosts();
    })
    .catch(() => {});
};

/**
 * 根据文章 ID 回收文章
 * @param ids 文章 ID 数组
 */
const recyclePost = (ids: Array<number>) => {
  recyclePosts(ids)
    .then(() => {
      // 清空选中文章
      currentSelectedPostIds.value = [];
      optionSuccessMsg();
      // 刷新文章
      refreshPosts();
    })
    .catch(() => {});
};

/**
 * 多选文章删除按钮点击事件
 */
const onDeletePostsClick = () => {
  if (queryPostStatus.value === PostStatus.DELETED) {
    // 永久删除文章
    confirmDialog(
      `确定要 永久删除 选择的 ${currentSelectedPostIds.value.length} 篇文章吗？此操作不可逆`,
      () => {
        deletePost(currentSelectedPostIds.value);
      }
    );
  } else {
    // 将文章放入回收站
    confirmDialog(
      `确定要将选择的 ${currentSelectedPostIds.value.length} 篇文章移入回收站吗？`,
      () => {
        recyclePost(currentSelectedPostIds.value);
      }
    );
  }
};

/**
 * 将文章从回收站恢复到指定状态
 * @param ids 文章 ID 数组
 * @param status 文章状态
 */
const restorePost = (ids: Array<number>, status: PostStatus) => {
  restorePosts(ids, status)
    .then(() => {
      // 清空选择的文章
      currentSelectedPostIds.value = [];
      optionSuccessMsg();
      refreshPosts();
    })
    .catch(() => {});
};

/**
 * 多选文章恢复文章按钮点击事件
 * @param status 文章状态
 */
const onRestorePostsClick = (status: PostStatus) => {
  let msg: string = '';
  if (status === PostStatus.PUBLISHED) {
    msg = `确定要将选择的 ${currentSelectedPostIds.value.length} 篇文章发布吗？`;
  } else if (status === PostStatus.DRAFT) {
    msg = `确定要将选择的 ${currentSelectedPostIds.value.length} 篇文章转为草稿吗？`;
  }
  // 将文章从回收转为指定状态
  confirmDialog(msg, () => {
    restorePost(currentSelectedPostIds.value, status);
  });
};

/**
 * 将回收站文章恢复到指定状态
 * @param post
 * @param status
 */
const onRestorePostClick = (post: Post, status: PostStatus) => {
  let msg: string = '';
  if (status === PostStatus.PUBLISHED) {
    msg = `确定要将文章 [${post.title}] 发布吗？`;
  } else if (status === PostStatus.DRAFT) {
    msg = `确定要将文章 [${post.title}] 转为草稿吗？`;
  }
  // 将文章从回收转为指定状态
  confirmDialog(msg, () => {
    restorePost([post.postId], status);
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
    .catch(() => {});
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
 * 检索文章关键字输入框清除事件
 */
const onPostQueryKeyClear = () => {
  queryKey.value = null;
  refreshPosts();
};

/**
 * 检索文章清除事件
 */
const onPostQueryClear = () => {
  queryPostStatus.value = null;
  queryPostVisible.value = null;
  queryCategoryId.value = null;
  queryTagId.value = null;
  queryKey.value = null;
  queryKeyInput.value = '';
  querySort.value = null;
  // 刷新文章
  refreshPosts();
};

/**
 * 筛选条件按钮点击事件
 */
const onFilterBtnClick = () => {
  visibleQueryModal.value = true;
};

/**
 * 当前是否开启了文章过滤
 */
const isFiltered = (): boolean => {
  return (
    queryPostStatus.value !== null ||
    queryPostVisible.value !== null ||
    queryCategoryId.value !== null ||
    queryTagId.value !== null ||
    queryKey.value !== null
  );
};

/**
 * 按关键字检索文章按钮点击事件
 */
const onQueryKeyBtnClick = () => {
  // 先将关键字输入框内容赋值到查询关键字变量
  queryKey.value = queryKeyInput.value;
  // 刷新文章
  refreshPosts();
};

/**
 * 全选文章事件
 */
const onPostCheckedAll = () => {
  let ids = Array<number>();
  posts.value?.forEach((post) => {
    ids.push(post.postId);
  });
  currentSelectedPostIds.value = ids;
};

/**
 * 取消全选文章事件
 */
const onPostCancelChecked = () => {
  currentSelectedPostIds.value = [];
};

/**
 * 文章项选中事件
 * @param post 文章接口
 */
const onPostItemChecked = (post: Post) => {
  currentSelectedPostIds.value.push(post.postId);
};

/**
 * 文章项取消选中事件
 * @param post 文章接口
 */
const onPostItemUnChecked = (post: Post) => {
  currentSelectedPostIds.value = currentSelectedPostIds.value.filter((id) => {
    return id !== post.postId;
  });
};
</script>

<template>
  <div class="container">
    <my-post-setting-modal
      v-model:show="visibleSettingPostDialog"
      :post="currentClickPost!!"
      @on-post-update="refreshPosts()"
    />

    <n-modal v-model:show="visibleQueryModal" preset="dialog" title="文章筛选">
      <n-form>
        <n-form-item label="文章状态">
          <n-select
            style="min-width: 90px"
            :options="queryPostStatusSelectOptions"
            v-model:value="queryPostStatus"
            @update:value="refreshPosts"
            placeholder="状态"
            clearable
          />
        </n-form-item>
        <n-form-item label="文章可见性">
          <n-select
            style="min-width: 80px"
            :options="queryPostVisibleSelectOptions"
            v-model:value="queryPostVisible"
            @update:value="refreshPosts"
            placeholder="可见性"
            clearable
          />
        </n-form-item>

        <n-form-item label="分类">
          <n-select
            style="min-width: 140px"
            :options="categoriesSelectOptions"
            v-model:value="queryCategoryId"
            placeholder="分类"
            clearable
            @clear="queryCategoryId = null"
            @update:value="refreshPosts"
          />
        </n-form-item>

        <n-form-item label="标签">
          <n-select
            style="min-width: 160px"
            :options="tagsSelectOptions"
            v-model:value="queryTagId"
            placeholder="标签"
            :render-label="onTagSelectRenderLabel"
            clearable
            @clear="queryTagId = null"
            @update:value="refreshPosts"
          />
        </n-form-item>

        <n-form-item label="关键字（标题、别名、摘要、文章内容）">
          <n-input-group>
            <n-input
              v-model:value="queryKeyInput"
              placeholder="关键字检索"
              clearable
              @clear="onPostQueryKeyClear"
            />

            <n-button @click="onQueryKeyBtnClick">
              <template #icon>
                <n-icon>
                  <SearchIcon />
                </n-icon>
              </template>
            </n-button>
          </n-input-group>
        </n-form-item>
        <n-button
          @click="onPostQueryClear"
          style="width: 100%"
          :type="isFiltered() ? 'warning' : 'primary'"
        >
          <template #icon>
            <n-icon>
              <RefreshIcon />
            </n-icon>
          </template>
        </n-button>
      </n-form>
    </n-modal>

    <my-card
      :data-count="totalPosts"
      :show-empty-status="posts !== null && posts.length === 0"
      :current-page="currentPage"
      :page-size="pageSize"
      :page-count="totalPages"
      :current-page-item-count="posts?.length ?? 0"
      show-pagination
      show-checkbox
      item-string="文章"
      :is-checked="
        currentSelectedPostIds.length === posts?.length && posts.length !== 0
      "
      @on-page-update="onPageUpdate"
      @on-page-size-update="onPageSizeUpdate"
      @on-checked="onPostCheckedAll"
      @on-checkbox-cancel="onPostCancelChecked"
    >
      <template #header-checkbox-button>
        <div style="margin-top: 2px">
          <n-space v-if="currentSelectedPostIds.length > 0">
            <!-- 删除多选文章按钮 -->
            <n-button type="error" @click="onDeletePostsClick" size="small">
              <template #icon>
                <n-icon>
                  <TrashIcon />
                </n-icon>
              </template>
            </n-button>

            <!-- 将文章转为草稿 -->
            <n-button
              type="warning"
              @click="onRestorePostsClick(PostStatus.DRAFT)"
              size="small"
            >
              <template #icon>
                <n-icon>
                  <DraftIcon />
                </n-icon>
              </template>
            </n-button>

            <!-- 将文章发布 -->
            <n-button
              type="primary"
              @click="onRestorePostsClick(PostStatus.PUBLISHED)"
              size="small"
            >
              <template #icon>
                <n-icon>
                  <PublishIcon />
                </n-icon>
              </template>
            </n-button>
          </n-space>
        </div>
      </template>
      <template #header-extra>
        <n-space>
          <n-select
            v-if="
              queryPostStatus !== PostStatus.DELETED &&
              !globalStore.isSmallWindow
            "
            style="min-width: 140px"
            :options="queryPostSortSelectOptions"
            v-model:value="querySort"
            placeholder="排序方式"
            clearable
            @clear="querySort = null"
            @update:value="refreshPosts"
          />
          <n-button-group>
            <n-button
              secondary
              :type="isFiltered() ? 'warning' : 'primary'"
              @click="onFilterBtnClick"
            >
              <template #icon>
                <n-icon>
                  <FunnelIcon />
                </n-icon>
              </template>
              <span v-if="!globalStore.isSmallWindow">筛选条件</span>
            </n-button>
            <n-button
              type="warning"
              v-if="isFiltered()"
              @click="onPostQueryClear"
            >
              <template #icon>
                <n-icon>
                  <RefreshIcon />
                </n-icon>
              </template>
            </n-button>
          </n-button-group>
          <n-button type="primary" @click="onAddPostClick">
            <template #icon>
              <n-icon>
                <AddIcon />
              </n-icon>
            </template>
            <span v-if="!globalStore.isSmallWindow">添加文章</span>
          </n-button>
        </n-space>
      </template>
      <template #content>
        <!-- 文章列表 -->
        <n-list hoverable>
          <post-list-item
            v-for="post in posts"
            :key="post.postId"
            :post="post"
            :is-checked="currentSelectedPostIds.includes(post.postId)"
            @on-edit-post="onEditPost"
            @on-setting-post="onSettingPost"
            @on-delete-post="onDeletePost"
            @on-post-status-badge-click="onPostStatusBadgeClick"
            @on-post-visible-badge-click="onPostVisibleBadgeClick"
            @on-post-pinned-badge-click="onPostPinnedBadgeClick"
            @on-post-encrypted-badge-click="onPostEncryptedBadgeClick"
            @on-checked="onPostItemChecked"
            @on-un-checked="onPostItemUnChecked"
            @on-restore-post="onRestorePostClick"
          />
        </n-list>
      </template>
    </my-card>
  </div>
</template>

<style scoped></style>
