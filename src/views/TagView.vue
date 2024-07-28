<script setup lang="ts">
import {
  FormInst,
  NButton,
  NColorPicker,
  NDropdown,
  NForm,
  NFormItem,
  NIcon,
  NInput,
  NModal,
  NSpace,
  NPopover,
  NList
} from 'naive-ui';
import {
  BookOutline as BookIcon,
  BrushOutline as EditIcon,
  TrashOutline as TrashIcon,
  AppsOutline as BlockIcon,
  ListOutline as ListIcon,
  AddOutline as AddIcon
} from '@vicons/ionicons5';
import { inject, onMounted, reactive, ref } from 'vue';
import {
  addTag,
  delTagsByIds,
  tag,
  tags as getTags,
  updateTag
} from '../apis/tagApi.ts';
import { Tag } from '../models/Tag.ts';
import { confirmDialog, errorMsg, successMsg } from '../utils/Message.ts';
import { DialogFormMode } from '../models/enum/DialogFormMode.ts';
import { StoreKey } from '../stores/StoreKey.ts';
import { Pager } from '../models/Pager.ts';
import { displayNameToSlug, renderIcon } from '../utils/MyUtils.ts';
import TagListItem from '../components/item/TagListItem.vue';
import TagComponent from '../components/component/MyTag.vue';
import MyCard from '../components/component/MyCard.vue';
import { useRoute } from 'vue-router';
import router from '../router';
import { RouterViews } from '../router/RouterViews.ts';
import { TagMode } from '../models/enum/TagMode.ts';
import { useGlobalStore } from '../stores/GlobalStore.ts';

// 全局响应式变量
const globalStore = useGlobalStore();

// 当前标签显示模式
const currentTagMode = ref<TagMode>(TagMode.BLOCK);

// 标签集合
const tags = ref<Array<Tag> | null>(null);

// 当前页
const currentPage = ref(1);
// 每页条数
const pageSize = ref(10);
// 总标签数
const totalTags = ref(0);
// 总页数
const totalPages = ref(0);

// 当前点击的菜单索引
const currentClickMenuIndex = ref(-1);
// 当前选择的标签 ID 数组
const currentSelectTagIds = ref(Array<number>());

// 标签点击显示的菜单项
const tagMenuOptions = [
  {
    label: '查看文章',
    key: 'viewPost',
    icon: renderIcon(BookIcon)
  },
  {
    type: 'divider'
  },
  {
    label: '编辑标签',
    key: 'edit',
    icon: renderIcon(EditIcon)
  },
  {
    label: '删除标签',
    key: 'delete',
    icon: renderIcon(TrashIcon)
  }
];
// 当前添加修改标签对话框的模式
const addEditMode = ref(DialogFormMode.ADD);
// 添加修改标签对话框引用
const addEditDialogRef = ref<FormInst | null>(null);
// 是否显示添加修改标签对话框
const visibleAddEditDialog = ref(false);
// 添加修改标签对话框是否加载中
const isAddEditDialogLoading = ref(false);
// 添加修改标签对话框表单
const formAddEdit = reactive({
  tagId: -1,
  displayName: '',
  slug: '',
  color: ''
});

// 路由引用
const route = useRoute();

onMounted(() => {
  // 读取设置
  loadSettings();

  // 查看路由是否传参
  let tagId = Number(route.query.tagId);
  if (!isNaN(tagId)) {
    // 获取标签
    tag(Number(tagId))
      .then((res) => {
        // 打开编辑标签页面
        onEditTag(res.data as Tag);
      })
      .catch((err) => errorMsg(err));
  }
  // 刷新标签数据
  refreshTags();
});

/**
 * 读取设置
 */
const loadSettings = () => {
  // 读取以前是否设置过标签显示模式
  let mode = Number(
    localStorage.getItem(StoreKey.TAG_MODE) ?? TagMode.BLOCK
  );

  if (!Object.values(TagMode).includes(mode)) {
    // 设置值有误，默认为块显示
    currentTagMode.value = TagMode.BLOCK;
  } else {
    currentTagMode.value = mode;
  }

  // 读取以前是否设置过每页大小
  let ps = Number(localStorage.getItem(StoreKey.TAG_PAGE_SIZE) ?? 10);
  if (isNaN(ps) || ps < 10 || ps > 120) {
    pageSize.value = 10;
  } else {
    pageSize.value = ps;
  }
}

/**
 * 刷新标签数据
 */
const refreshTags = () => {
  window.$loadingBar.start();
  if (currentTagMode.value === TagMode.BLOCK) {
    // 当前标签显示模式是块，获取所有标签
    getTags()
      .then((res) => {
        tags.value = res.data.data;
        // 设置总标签数
        totalTags.value = tags.value?.length ?? 0;
        window.$loadingBar.finish();
      })
      .catch((err) => {
        errorMsg(err);
        window.$loadingBar.error();
      });
  } else {
    // 当前标签显示模式是列表，分页获取标签
    getTagsByPage();
  }
};

/**
 * 分页获取标签
 */
const getTagsByPage = () => {
  getTags(currentPage.value, pageSize.value)
    .then((res) => {
      let pager = res.data as Pager<Tag>;
      if (pager.data?.length === 0 && pager.totalData !== 0) {
        // 当前页数量为空，并且总标签数不为空
        // 将当前页改为第一页，然后重新获取标签
        currentPage.value = 1;
        getTagsByPage();
        return;
      }
      tags.value = pager.data;
      totalTags.value = pager.totalData;
      totalPages.value = pager.totalPages;
      window.$loadingBar.finish();
    })
    .catch((err) => {
      errorMsg(err);
      window.$loadingBar.error();
    });
};

/**
 * 标签菜单选择事件
 * @param key 菜单 key
 */
const onTagMenuSelect = (key: string) => {
  let currentTag = tags.value?.[currentClickMenuIndex.value]!!;
  switch (key) {
    case 'delete':
      // 删除标签
      onDeleteTag(currentTag);
      break;
    case 'edit':
      // 编辑标签
      onEditTag(currentTag);
      break;
    case 'viewPost':
      // 查看文章
      router.push({
        name: RouterViews.POST.name,
        query: {
          tagId: currentTag.tagId
        }
      })
      break;
  }
};

/**
 * 删除标签事件
 * @param tag 要删除的标签
 */
const onDeleteTag = (tag: Tag) => {
  confirmDialog(
    '确定要删除标签 [' + tag?.displayName + '] 吗？此操作不可逆。',
    () => {
      deleteTags([tag.tagId!!]);
    }
  );
};

/**
 * 标签多选删除点击事件
 */
const onTagsDeleteClick = () => {
  let ids = Array<number>();
  currentSelectTagIds.value.forEach((id) => {
    ids.push(id);
  });
  confirmDialog(`确定要删除选择的 ${ids.length} 个标签吗？`, () => {
    deleteTags(ids);
  });
};

/**
 * 批量删除标签
 * @param ids 标签 ID 数组
 */
const deleteTags = (ids: Array<number>) => {
  // 删除标签
  delTagsByIds(ids)
    .then(() => {
      // 删除成功
      successMsg('删除成功');
      // 删除选择的标签数组项
      currentSelectTagIds.value = currentSelectTagIds.value.filter((id) => {
        return !ids.includes(id);
      });
      // 刷新标签列表
      refreshTags();
    })
    .catch((err) => {
      errorMsg(err);
    });
};

/**
 * 编辑标签事件
 * @param tag 要编辑的标签
 */
const onEditTag = (tag: Tag) => {
  // 清空添加修改标签对话框表单
  clearAddEditForm();
  // 将选择的标签数据加入对话框表单
  formAddEdit.tagId = tag.tagId!!;
  formAddEdit.displayName = tag.displayName;
  formAddEdit.slug = tag.slug;
  formAddEdit.color = tag.color ?? '';
  // 设置当前为编辑模式
  addEditMode.value = DialogFormMode.EDIT;
  // 显示对话框
  visibleAddEditDialog.value = true;
};

/**
 * 添加标签按钮点击事件
 */
const onAddTagClick = () => {
  // 清空添加修改标签对话框表单
  clearAddEditForm();
  // 设置当前为添加模式
  addEditMode.value = DialogFormMode.ADD;
  // 显示对话框
  visibleAddEditDialog.value = true;
};

/**
 * 添加修改标签对话框提交事件
 */
const onAddEditDialogSubmit = () => {
  // 验证表单是否有错误
  addEditDialogRef.value
    ?.validate((errors) => {
      if (!errors) {
        isAddEditDialogLoading.value = true;
        // 封装标签
        let tag: Tag = {
          tagId: formAddEdit.tagId,
          displayName: formAddEdit.displayName,
          slug: encodeURIComponent(formAddEdit.slug),
          color: formAddEdit.color
        };
        if (addEditMode.value === DialogFormMode.ADD) {
          // 添加标签
          addTag(tag)
            .then(() => {
              successMsg('添加成功');
              // 添加成功
              onAddEditDialogClose();
            })
            .catch((err) => {
              // 添加失败
              errorMsg(err);
              isAddEditDialogLoading.value = false;
            });
        } else {
          // 编辑标签
          updateTag(tag)
            .then(() => {
              // 修改成功
              successMsg('修改成功');
              onAddEditDialogClose();
            })
            .catch((err) => {
              errorMsg(err);
              isAddEditDialogLoading.value = false;
            });
        }
      }
    })
    .catch(() => {});
  return false;
};

/**
 * 添加修改标签对话框关闭后相关事件
 */
const onAddEditDialogClose = () => {
  // 停止对话框加载状态
  isAddEditDialogLoading.value = false;
  // 关闭对话框
  visibleAddEditDialog.value = false;
  // 清空对话框表单
  clearAddEditForm();
  // 刷新标签
  refreshTags();
};

/**
 * 清空添加修改标签对话框表单
 */
const clearAddEditForm = () => {
  formAddEdit.tagId = -1;
  formAddEdit.displayName = '';
  formAddEdit.slug = '';
  formAddEdit.color = '';
};

/**
 * 添加修改标签对话框标签名输入框改变事件
 * @param value
 */
const onAddEditDialogDisplayNameUpdate = (value: string) => {
  formAddEdit.displayName = value;
  // 只有在添加模式，才同步修改别名
  if (addEditMode.value === DialogFormMode.ADD) {
    // 将显示名称转别名
    formAddEdit.slug = displayNameToSlug(value);
  }
};

/**
 * 标签显示模式改变事件
 * @param mode 标签模式
 */
const onTagModeChange = (mode: TagMode) => {
  currentTagMode.value = mode;
  // 刷新标签
  refreshTags();
  // 将标签模式存储
  localStorage.setItem(StoreKey.TAG_MODE, mode.toString());
};

/**
 * 分页组件当前页改变事件
 * @param page 当前页
 */
const onPageUpdate = (page: number) => {
  currentPage.value = page;
  // 刷新标签
  refreshTags();
};

/**
 * 分页组件每页大小改变事件
 * @param size 每页大小
 */
const onPageSizeUpdate = (size: number) => {
  pageSize.value = size;
  // 将每页大小存储
  localStorage.setItem(StoreKey.TAG_PAGE_SIZE, size.toString());
  // 刷新标签
  refreshTags();
};

/**
 * 标签选中事件
 * @param tag
 */
const onTagChecked = (tag: Tag) => {
  currentSelectTagIds.value.push(tag.tagId!!);
};

/**
 * 标签取消选中事件
 * @param tag
 */
const onTagUnChecked = (tag: Tag) => {
  currentSelectTagIds.value = currentSelectTagIds.value.filter((id) => {
    return id !== tag.tagId;
  });
};

/**
 * 标签全选事件
 */
const onTagCheckedAll = () => {
  currentSelectTagIds.value = [];
  tags.value?.forEach((tag) => {
    currentSelectTagIds.value.push(tag.tagId!!);
  });
};

/**
 * 标签取消全选事件
 */
const onTagCancelChecked = () => {
  currentSelectTagIds.value = [];
};
</script>

<template>
  <div class="container">
    <!-- 添加 / 修改标签模态框 -->
    <n-modal
      v-model:show="visibleAddEditDialog"
      preset="dialog"
      :title="addEditMode == DialogFormMode.ADD ? '添加标签' : '标签设置'"
      :positive-text="addEditMode == DialogFormMode.ADD ? '添加' : '保存'"
      negative-text="取消"
      :loading="isAddEditDialogLoading"
      @positiveClick="onAddEditDialogSubmit"
      @keydown.enter="onAddEditDialogSubmit"
    >
      <template #default>
        <n-form ref="addEditDialogRef" class="dialog-form" :model="formAddEdit">
          <n-form-item
            label="标签名"
            path="displayName"
            :rule="{ required: true, message: '请输入标签名' }"
          >
            <n-input
              v-model:default-value="formAddEdit.displayName"
              placeholder="标签名"
              @update-value="onAddEditDialogDisplayNameUpdate"
              maxlength="50"
            />
          </n-form-item>
          <n-form-item
            label="别名"
            path="slug"
            :rule="{ required: true, message: '请输入标签别名' }"
          >
            <n-input
              v-model:value="formAddEdit.slug"
              placeholder="标签别名"
              maxlength="50"
            />
          </n-form-item>
          <n-form-item label="颜色" path="color">
            <n-color-picker
              v-model:value="formAddEdit.color"
              :actions="['clear']"
              :modes="['hex']"
              :show-alpha="false"
            />
          </n-form-item>
        </n-form>
      </template>
    </n-modal>

    <my-card
      :data-count="totalTags"
      :show-empty-status="tags !== null && tags.length === 0"
      :current-page="currentPage"
      :page-size="pageSize"
      :page-count="totalPages"
      :current-page-item-count="tags?.length ?? 0"
      :show-pagination="currentTagMode == TagMode.LIST"
      item-string= "标签"
      @on-page-update="onPageUpdate"
      @on-page-size-update="onPageSizeUpdate"
      show-checkbox
      @on-checked="onTagCheckedAll"
      @on-checkbox-cancel="onTagCancelChecked"
      :is-checked="
        currentSelectTagIds.length === tags?.length && tags.length !== 0
      "
      :show-delete-button="currentSelectTagIds.length > 0"
      @on-delete-button-click="onTagsDeleteClick"
    >
      <template #header-extra>
        <n-button type="primary" @click="onAddTagClick">
          <template #icon>
            <n-icon>
              <AddIcon />
            </n-icon>
          </template>
          <span v-if="!globalStore.isSmallWindow">添加标签</span>
        </n-button>
      </template>
      <template #content>
        <!-- 标签块 -->
        <div style="padding: 10px" v-if="currentTagMode === TagMode.BLOCK">
          <n-space>
            <div
              v-for="(tag, index) in tags"
              @click="currentClickMenuIndex = index"
            >
              <n-popover trigger="hover" :keep-alive-on-hover="false">
                <template #trigger>
                  <div>
                    <n-dropdown
                      trigger="click"
                      :options="tagMenuOptions"
                      show-arrow
                      @select="onTagMenuSelect"
                    >
                      <tag-component size="medium" :tag="tag" pointer />
                    </n-dropdown>
                  </div>
                </template>
                <span>{{ tag.slug }}</span>
              </n-popover>
            </div>
          </n-space>
        </div>
        <!-- 标签列表 -->
        <div v-if="currentTagMode === TagMode.LIST">
          <n-list hoverable>
            <tag-list-item
              v-for="tag in tags"
              :tag="tag"
              :is-checked="currentSelectTagIds.includes(tag.tagId!!)"
              @on-delete-tag="onDeleteTag"
              @on-edit-tag="onEditTag"
              @on-checked="onTagChecked"
              @on-un-checked="onTagUnChecked"
            />
          </n-list>
        </div>
      </template>
      <template #action-left>
        <n-space>
          <n-button
            class="btn-switch-mode"
            circle
            size="small"
            :secondary="currentTagMode === TagMode.BLOCK"
            @click="onTagModeChange(TagMode.BLOCK)"
          >
            <template #icon>
              <BlockIcon />
            </template>
          </n-button>
          <n-button
            class="btn-switch-mode"
            circle
            size="small"
            :secondary="currentTagMode === TagMode.LIST"
            @click="onTagModeChange(TagMode.LIST)"
          >
            <template #icon>
              <ListIcon />
            </template>
          </n-button>
        </n-space>
      </template>
    </my-card>
  </div>
</template>

<style scoped></style>
