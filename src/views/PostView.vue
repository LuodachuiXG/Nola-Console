<script setup lang="ts">
import {
  FormInst,
  NButton,
  NIcon,
  NList,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NInputGroup,
  NText,
  NScrollbar,
  NSwitch,
  NPopover,
  NSpace,
  NSelect,
  SelectOption
} from 'naive-ui';
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import { StoreEnum } from '../models/enum/StoreEnum.ts';
import { Post } from '../models/Post.ts';
import MyCard from '../components/component/MyCard.vue';
import PostListItem from '../components/item/PostListItem.vue';
import {
  posts as getPosts,
  recyclePosts,
  updatePostStatus
} from '../apis/postApi.ts';
import { PostStatus } from '../models/enum/PostStatus.ts';
import { PostVisible } from '../models/enum/PostVisible.ts';
import { PostSort } from '../models/enum/PostSort.ts';
import { confirmDialog, errorMsg, optionSuccessMsg } from '../utils/Message.ts';
import { Pager } from '../models/Pager.ts';
import {
  displayNameToSlug,
  formatTimestamp,
  isCurrentSmallWindow
} from '../utils/MyUtils.ts';
import {
  AddOutline as AddIcon,
  RefreshOutline as RefreshIcon,
  FileTrayFullOutline as FileIcon,
  LockOpenOutline as LockOpenIcon,
  FlashOutline as FlashIcon,
  FlashOffOutline as FlashOffIcon
} from '@vicons/ionicons5';
import { tags } from '../apis/tagApi.ts';
import { categories } from '../apis/categoryApi.ts';
import { Tag } from '../models/Tag.ts';
import { Category } from '../models/Category.ts';

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
const tagsList = ref<Array<Tag> | null>(null);
// 标签选择器列表
const tagsSelectOptions = ref<Array<SelectOption>>();
// 分类列表
const categoriesList = ref<Array<Category> | null>(null);
// 分类选择器列表
const categoriesSelectOptions = ref<Array<SelectOption>>();

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
const formSettingPostTagIds = ref<Array<number>>();
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
  refreshTagAndCategory();
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
 * 刷新标签和分类
 */
const refreshTagAndCategory = () => {
  // 获取所有标签
  tags(0, 0)
    .then((res) => {
      tagsList.value = res.data.data;
      // 将标签封装到标签选择器列表中
      let selectList = Array<SelectOption>();
      tagsList.value?.forEach((tag) => {
        selectList.push({
          label: tag.displayName,
          value: tag.tagId!!
        });
      });
      tagsSelectOptions.value = selectList;
    })
    .catch((err) => errorMsg('标签获取失败：' + err));
  // 获取所有分类
  categories(0, 0)
    .then((res) => {
      categoriesList.value = res.data.data;
      // 将分类封装到分类选择器列表中
      let selectList = Array<SelectOption>();
      categoriesList.value?.forEach((category) => {
        selectList.push({
          label: category.displayName,
          value: category.categoryId!!
        });
      });
      categoriesSelectOptions.value = selectList;
    })
    .catch((err) => errorMsg('分类获取失败：' + err));
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
 * 设置文章对话框提交事件
 */
const onSettingPostDialogSubmit = () => {};
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
                  v-model:value="formSettingPostCategoryId"
                  @focus="console.log(formSettingPostCategoryId)"
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

              <n-form-item label="评论 & 置顶" path="allowComment">
                <n-space>
                  <n-switch v-model:value="formSettingPost.allowComment">
                    <template #checked>
                      <span>允许评论</span>
                    </template>
                    <template #unchecked>
                      <span>禁止评论</span>
                    </template>
                  </n-switch>
                  <n-switch v-model:value="formSettingPost.pinned">
                    <template #checked>
                      <span>置顶文章</span>
                    </template>
                    <template #unchecked>
                      <span>默认文章</span>
                    </template>
                  </n-switch>
                </n-space>
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
          />
        </n-list>
      </template>
    </my-card>
  </div>
</template>

<style scoped></style>
