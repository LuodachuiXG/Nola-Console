<script setup lang="ts">
import {
  FormInst,
  NButton,
  NForm,
  NFormItem,
  NInput,
  NModal,
  NList,
  NSwitch
} from 'naive-ui';
import { onMounted, reactive, ref } from 'vue';
import {
  addCategory,
  delCategoriesByIds,
  categories as getCategories,
  updateCategory
} from '../apis/categoryApi.ts';
import { Category } from '../models/Category.ts';
import { confirmDialog, errorMsg, successMsg } from '../utils/Message.ts';
import { DialogFormMode } from '../models/enum/DialogFormMode.ts';
import { StoreEnum } from '../models/enum/StoreEnum.ts';
import { Pager } from '../models/Pager.ts';
import { displayNameToSlug } from '../utils/MyUtils.ts';
import CategoryListItem from '../components/item/CategoryListItem.vue';
import MyCard from '../components/component/MyCard.vue';

// 分类集合
const categories = ref<Array<Category> | null>(null);

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

onMounted(() => {
  // 读取以前是否设置过每页大小
  pageSize.value = Number(
    localStorage.getItem(StoreEnum.CATEGORY_PAGE_SIZE) ?? 10
  );

  // 刷新分类数据
  refreshCategories();
});

/**
 * 刷新分类数据
 */
const refreshCategories = () => {
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
    })
    .catch((err) => {
      errorMsg(err);
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
      // 删除分类
      delCategoriesByIds([category?.categoryId!!])
        .then(() => {
          // 删除成功
          successMsg('删除成功');
          // 刷新分类列表
          refreshCategories();
        })
        .catch((err) => {
          errorMsg(err);
        });
    }
  );
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
  // 清空对话框表单
  clearAddEditForm();
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
  localStorage.setItem(StoreEnum.CATEGORY_PAGE_SIZE, size.toString());
  // 刷新分类
  refreshCategories();
};
</script>

<template>
  <div class="container">
    <!-- 添加 / 修改分类模态框 -->
    <n-modal
      v-model:show="visibleAddEditDialog"
      preset="dialog"
      :title="addEditMode == DialogFormMode.ADD ? '添加分类' : '编辑分类'"
      :positive-text="addEditMode == DialogFormMode.ADD ? '添加' : '编辑'"
      negative-text="取消"
      :loading="isAddEditDialogLoading"
      @positiveClick="onAddEditDialogSubmit"
    >
      <template #default>
        <n-form ref="addEditDialogRef" class="dialog-form" :model="formAddEdit">
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
              show-count
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
              show-count
            />
          </n-form-item>
          <n-form-item
            label="封面"
            path="cover"
            :rule="{ type: 'url', message: '封面地址有误' }"
          >
            <n-input
              v-model:value="formAddEdit.cover"
              placeholder="分类封面地址"
              maxlength="256"
              show-count
            />
          </n-form-item>
          <n-form-item label="统一封面" path="unifiedCover">
            <n-switch
              v-model:value="formAddEdit.unifiedCover"
              :disabled="
                formAddEdit.cover === null || formAddEdit.cover.length === 0
              "
            />
          </n-form-item>
        </n-form>
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
    >
      <template #header-extra>
        <n-button type="primary" @click="onAddCategoryClick">添加分类</n-button>
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
          />
        </n-list>
      </template>
    </my-card>
  </div>
</template>

<style scoped>
</style>
