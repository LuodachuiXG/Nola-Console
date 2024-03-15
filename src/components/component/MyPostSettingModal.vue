<!-- 文章设置模态框 -->
<script setup lang="ts">
import {
  FormInst,
  NButton,
  NDivider,
  NForm,
  NFormItem,
  NIcon,
  NInput,
  NInputGroup,
  NModal,
  NPopover,
  NScrollbar,
  NSelect,
  NSwitch,
  NTag,
  NText,
  SelectRenderTag,
  SelectOption,
  NSpace
} from 'naive-ui';
import {
  FileTrayFullOutline as FileIcon,
  FlashOffOutline as FlashOffIcon,
  FlashOutline as FlashIcon,
  LockOpenOutline as LockOpenIcon,
  RefreshOutline as RefreshIcon
} from '@vicons/ionicons5';
import { updatePost } from '../../apis/postApi.ts';
import { displayNameToSlug, isNumberType } from '../../utils/MyUtils.ts';
import { defineModel, h, onMounted, reactive, ref, watch } from 'vue';
import { PostStatus } from '../../models/enum/PostStatus.ts';
import { PostVisible } from '../../models/enum/PostVisible.ts';
import { TagColor } from 'naive-ui/es/tag/src/common-props';
import { addCategory, categories } from '../../apis/categoryApi.ts';
import { PostRequest } from '../../models/request/PostRequest.ts';
import { addTag, tags } from '../../apis/tagApi.ts';
import { Post } from '../../models/Post.ts';
import { errorMsg, optionSuccessMsg } from '../../utils/Message.ts';
import { Category } from '../../models/Category.ts';
import { Tag } from '../../models/Tag.ts';
import MyTag from './MyTag.vue';

// 是否显示模态框
const show = defineModel('show', {
  required: true,
  type: Boolean,
  default: false
});

const props = defineProps<{
  post: Post | null;
}>();

const emit = defineEmits<{
  (e: 'onPostUpdate'): void;
  (e: 'onCancel'): void;
}>();

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

// 标签列表
const tagsList = ref(Array<Tag>());
// 标签选择器列表
const tagsSelectOptions = ref(Array<SelectOption>());
// 分类列表
const categoriesList = ref(Array<Category>());
// 分类选择器列表
const categoriesSelectOptions = ref(Array<SelectOption>());

onMounted(() => {
  // 刷新标签和分类数据
  refreshTag();
  refreshCategory();

  watch(show, (value: boolean) => {
    if (value) {
      // show 为 true，显示模态框
      // 将文章数据填充到表单
      post2Form(props.post);
    }
  });
});

/**
 * 将文章数据填充到表单
 * @param post 文章接口
 */
const post2Form = (post: Post | null) => {
  if (post === null) return;

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

  // 将文章的标签和分类填充到表单
  let tagIds = Array<number>();
  post.tags.forEach((tag) => {
    tagIds.push(tag.tagId!!);
  });
  formSettingPostTagIds.value = tagIds;
  formSettingPostCategoryId.value = post.category?.categoryId;
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

  if (isNumberType(value)) {
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
    if (isNumberType(v)) {
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
        let encrypted: boolean | null;
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
          categoryId: formSettingPostCategoryId.value ?? null,
          tagIds: formSettingPostTagIds.value,
          content: null
        };

        // 更新文章
        updatePost(postRequest)
          .then(() => {
            emit('onPostUpdate');
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
  show.value = false;
};
</script>

<template>
  <!-- 设置文章对话框 -->
  <n-modal
    v-model:show="show"
    preset="dialog"
    title="文章设置"
    positive-text="保存"
    negative-text="取消"
    :loading="isSettingPostDialogLoading"
    @positiveClick="onSettingPostDialogSubmit"
    @close="emit('onCancel')"
    @keydown.enter="onSettingPostDialogSubmit"
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
</template>

<style scoped></style>
