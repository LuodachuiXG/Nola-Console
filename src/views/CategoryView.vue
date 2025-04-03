<script setup lang="ts">
import {
  FormInst,
  NButton,
  NForm,
  NFormItem,
  NInput,
  NModal,
  NList,
  NSwitch,
  NIcon,
  NImage,
  NSpace,
  NPopover,
  NInputGroup,
  NScrollbar
} from 'naive-ui';
import { AddOutline as AddIcon } from '@vicons/ionicons5';
import { onMounted, reactive, ref } from 'vue';
import {
  addCategory,
  delCategoriesByIds,
  categories as getCategories,
  updateCategory,
  category
} from '../apis/categoryApi.ts';
import { Category } from '../models/Category.ts';
import { confirmDialog, errorMsg, successMsg } from '../utils/Message.ts';
import { DialogFormMode } from '../models/enum/DialogFormMode.ts';
import { StoreKey } from '../stores/StoreKey.ts';
import { Pager } from '../models/Pager.ts';
import { displayNameToSlug, isImage } from '../utils/MyUtils.ts';
import CategoryListItem from '../components/item/CategoryListItem.vue';
import MyCard from '../components/component/MyCard.vue';
import { useRoute } from 'vue-router';
import { FileTrayFullOutline as FileIcon } from '@vicons/ionicons5';
import MyFileSelectModal from '../components/component/MyFileSelectModal.vue';
import { MFile } from '../models/MFile.ts';
import { getRealUrl } from '../utils/NetworkUtil.ts';
import { useGlobalStore } from '../stores/GlobalStore.ts';

// 全局响应式变量
const globalStore = useGlobalStore();

// 分类集合
const categories = ref<Array<Category> | null>(null);

// 当前选择的分类 ID 数组
const currentSelectCategoryIds = ref(Array<number>());

// 当前页
const currentPage = ref(1);
// 每页条数
const pageSize = ref(10);
// 总分类数
const totalCategories = ref(0);
// 总页数
const totalPages = ref(0);

// 当前添加修改分类对话框的模式
const addEditMode = ref(DialogFormMode.ADD);
// 添加修改分类对话框引用
const addEditDialogRef = ref<FormInst | null>(null);
// 是否显示添加修改分类对话框
const visibleAddEditDialog = ref(false);
// 添加修改分类对话框是否加载中
const isAddEditDialogLoading = ref(false);
// 添加修改分类对话框表单
const formAddEdit = reactive({
  categoryId: -1,
  displayName: '',
  slug: '',
  cover: null as string | null,
  unifiedCover: false
});

// 是否显示选择文件模态框
const visibleFileSelectModal = ref(false);

// 路由引用
const route = useRoute();

onMounted(() => {
  // 读取设置
  loadSetting();

  // 查看路由是否传参
  let categoryId = Number(route.query.categoryId);
  if (!isNaN(categoryId)) {
    // 获取分类
    category(Number(categoryId))
      .then((res) => {
        // 打开编辑分类页面
        onEditCategory(res.data as Category);
      })
      .catch((err) => errorMsg(err));
  }

  // 刷新分类数据
  refreshCategories();
});

/**
 * 读取设置
 */
const loadSetting = () => {
  // 读取以前是否设置过每页大小
  let ps = Number(localStorage.getItem(StoreKey.CATEGORY_PAGE_SIZE.toString()) ?? 10);
  if (isNaN(ps) || ps < 10 || ps > 120) {
    pageSize.value = 10;
  } else {
    pageSize.value = ps;
  }
};

/**
 * 刷新分类数据
 */
const refreshCategories = () => {
  window.$loadingBar.start();
  // 分页获取分类
  getCategories(currentPage.value, pageSize.value)
    .then((res) => {
      let pager = res.data as Pager<Category>;
      if (pager.data?.length === 0 && pager.totalData !== 0) {
        // 当前页数量为空，并且总分类数不为空
        // 将当前页改为第一页，然后重新获取分类
        currentPage.value = 1;
        refreshCategories();
        return;
      }
      categories.value = pager.data;
      totalCategories.value = pager.totalData;
      totalPages.value = pager.totalPages;
      window.$loadingBar.finish();
    })
    .catch((err) => {
      errorMsg(err);
      window.$loadingBar.error();
    });
};

/**
 * 删除分类事件
 * @param category 要删除的分类
 */
const onDeleteCategory = (category: Category) => {
  confirmDialog(
    '确定要删除分类 [' + category?.displayName + '] 吗？此操作不可逆。',
    () => {
      deleteCategories([category.categoryId!!]);
    }
  );
};

/**
 * 分类多选删除点击事件
 */
const onCategoriesDeleteClick = () => {
  let ids = Array<number>();
  currentSelectCategoryIds.value.forEach((id) => {
    ids.push(id);
  });
  confirmDialog(`确定要删除选择的 ${ids.length} 个分类吗？`, () => {
    deleteCategories(ids);
  });
};

/**
 * 批量删除分类
 * @param ids
 */
const deleteCategories = (ids: Array<number>) => {
  // 删除分类
  delCategoriesByIds(ids)
    .then(() => {
      // 删除成功
      successMsg('删除成功');
      // 删除选择的分类数组项
      currentSelectCategoryIds.value = currentSelectCategoryIds.value.filter(
        (id) => {
          return !ids.includes(id);
        }
      );
      // 刷新分类列表
      refreshCategories();
    })
    .catch((err) => {
      errorMsg(err);
    });
};

/**
 * 编辑分类事件
 * @param category 要编辑的分类
 */
const onEditCategory = (category: Category) => {
  // 清空添加修改分类对话框表单
  clearAddEditForm();
  // 将选择的分类数据加入对话框表单
  formAddEdit.categoryId = category.categoryId!!;
  formAddEdit.displayName = category.displayName;
  formAddEdit.slug = category.slug;
  formAddEdit.cover = category.cover;
  formAddEdit.unifiedCover = category.unifiedCover;
  // 设置当前为编辑模式
  addEditMode.value = DialogFormMode.EDIT;
  // 显示对话框
  visibleAddEditDialog.value = true;
};

/**
 * 添加分类按钮点击事件
 */
const onAddCategoryClick = () => {
  // 清空添加修改分类对话框表单
  clearAddEditForm();
  // 设置当前为添加模式
  addEditMode.value = DialogFormMode.ADD;
  // 显示对话框
  visibleAddEditDialog.value = true;
};

/**
 * 添加修改分类对话框提交事件
 */
const onAddEditDialogSubmit = () => {
  // 验证表单是否有错误
  addEditDialogRef.value
    ?.validate((errors) => {
      if (!errors) {
        isAddEditDialogLoading.value = true;
        // 封装分类
        let category: Category = {
          categoryId: formAddEdit.categoryId,
          displayName: formAddEdit.displayName,
          slug: encodeURIComponent(formAddEdit.slug),
          cover: formAddEdit.cover,
          unifiedCover: formAddEdit.unifiedCover
        };
        if (addEditMode.value === DialogFormMode.ADD) {
          // 添加分类
          addCategory(category)
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
          // 编辑分类
          updateCategory(category)
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
 * 添加修改分类对话框关闭后相关事件
 */
const onAddEditDialogClose = () => {
  // 停止对话框加载状态
  isAddEditDialogLoading.value = false;
  // 关闭对话框
  visibleAddEditDialog.value = false;
  // 刷新分类
  refreshCategories();
};

/**
 * 清空添加修改分类对话框表单
 */
const clearAddEditForm = () => {
  formAddEdit.categoryId = -1;
  formAddEdit.displayName = '';
  formAddEdit.slug = '';
  formAddEdit.cover = null;
  formAddEdit.unifiedCover = false;
};

/**
 * 添加修改分类对话框分类名输入框改变事件
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
 * 分页组件当前页改变事件
 * @param page 当前页
 */
const onPageUpdate = (page: number) => {
  currentPage.value = page;
  // 刷新分类
  refreshCategories();
};

/**
 * 分页组件每页大小改变事件
 * @param size 每页大小
 */
const onPageSizeUpdate = (size: number) => {
  pageSize.value = size;
  // 将每页大小存储
  localStorage.setItem(StoreKey.CATEGORY_PAGE_SIZE.toString(), size.toString());
  // 刷新分类
  refreshCategories();
};

/**
 * 分类选中事件
 * @param category
 */
const onCategoryChecked = (category: Category) => {
  currentSelectCategoryIds.value.push(category.categoryId!!);
};

/**
 * 分类取消选中事件
 * @param category
 */
const onCategoryUnChecked = (category: Category) => {
  currentSelectCategoryIds.value = currentSelectCategoryIds.value.filter(
    (id) => {
      return id !== category.categoryId;
    }
  );
};

/**
 * 分类全选事件
 */
const onCategoryCheckedAll = () => {
  currentSelectCategoryIds.value = [];
  categories.value?.forEach((category) => {
    currentSelectCategoryIds.value.push(category.categoryId!!);
  });
};

/**
 * 标签取消全选事件
 */
const onCategoryCancelChecked = () => {
  currentSelectCategoryIds.value = [];
};

/**
 * 选择封面文件确认事件
 * @param files 因为设置了不可多选，所以这里只会有一个文件
 */
const onCoverFileSelectConfirm = (files: Array<MFile>) => {
  let file = files[0];
  if (!isImage(file.displayName)) {
    // 当前选择的文件不是图片
    errorMsg('只能选择图片文件');
    return;
  }
  formAddEdit.cover = file.url;
};
</script>

<template>
  <div class="container">
    <!-- 选择文件模态框 -->
    <my-file-select-modal
      v-model:show="visibleFileSelectModal"
      :multiple="false"
      @on-confirm="onCoverFileSelectConfirm"
    />

    <!-- 添加 / 修改分类模态框 -->
    <n-modal
      v-model:show="visibleAddEditDialog"
      preset="dialog"
      :title="addEditMode == DialogFormMode.ADD ? '添加分类' : '分类设置'"
      :positive-text="addEditMode == DialogFormMode.ADD ? '添加' : '保存'"
      negative-text="取消"
      :loading="isAddEditDialogLoading"
      @positiveClick="onAddEditDialogSubmit"
      @keydown.enter="onAddEditDialogSubmit"
    >
      <template #default>
        <n-scrollbar style="max-height: 70vh; padding-right: 12px">
          <n-form
            ref="addEditDialogRef"
            class="dialog-form"
            :model="formAddEdit"
            style="margin: 10px 5px"
          >
            <n-form-item
              label="分类名"
              path="displayName"
              :rule="{ required: true, message: '请输入分类名' }"
            >
              <n-input
                v-model:default-value="formAddEdit.displayName"
                placeholder="分类名"
                @update-value="onAddEditDialogDisplayNameUpdate"
                maxlength="50"
              />
            </n-form-item>
            <n-form-item
              label="分类别名"
              path="slug"
              :rule="{ required: true, message: '请输入分类别名' }"
            >
              <n-input
                v-model:value="formAddEdit.slug"
                placeholder="分类别名"
                maxlength="50"
              />
            </n-form-item>

            <n-form-item
              label="统一封面（如果文章未设置封面）"
              path="unifiedCover"
            >
              <n-switch v-model:value="formAddEdit.unifiedCover" />
            </n-form-item>
            <n-form-item label="封面" path="cover">
              <n-space vertical style="width: 100%">
                <n-input-group>
                  <n-input
                    v-model:value="formAddEdit.cover"
                    placeholder="分类封面地址"
                    maxlength="256"
                    clearable
                  />
                  <n-popover>
                    <template #trigger>
                      <n-button @click="visibleFileSelectModal = true">
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
                <n-image
                  :width="380"
                  object-fit="cover"
                  v-if="formAddEdit.cover"
                  :src="getRealUrl(formAddEdit.cover)"
                />
              </n-space>
            </n-form-item>
          </n-form>
        </n-scrollbar>
      </template>
    </n-modal>

    <my-card
      :data-count="totalCategories"
      :show-empty-status="categories !== null && categories.length === 0"
      :current-page="currentPage"
      :page-size="pageSize"
      :page-count="totalPages"
      :current-page-item-count="categories?.length ?? 0"
      show-pagination
      item-string="分类"
      @on-page-update="onPageUpdate"
      @on-page-size-update="onPageSizeUpdate"
      show-checkbox
      @on-checked="onCategoryCheckedAll"
      @on-checkbox-cancel="onCategoryCancelChecked"
      :is-checked="
        currentSelectCategoryIds.length === categories?.length &&
        categories.length !== 0
      "
      :show-delete-button="currentSelectCategoryIds.length > 0"
      @on-delete-button-click="onCategoriesDeleteClick"
    >
      <template #header-extra>
        <n-button type="primary" @click="onAddCategoryClick">
          <template #icon>
            <n-icon>
              <AddIcon />
            </n-icon>
          </template>
          <span v-if="!globalStore.isSmallWindow">添加分类</span>
        </n-button>
      </template>
      <template #content>
        <!-- 分类列表 -->
        <n-list hoverable>
          <category-list-item
            v-for="category in categories"
            :key="category.categoryId"
            :category="category"
            @on-delete-category="onDeleteCategory"
            @on-edit-category="onEditCategory"
            :is-checked="
              currentSelectCategoryIds.includes(category.categoryId!!)
            "
            @on-checked="onCategoryChecked"
            @on-un-checked="onCategoryUnChecked"
          />
        </n-list>
      </template>
    </my-card>
  </div>
</template>

<style scoped></style>
