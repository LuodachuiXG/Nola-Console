<script setup lang="ts">
import {
  FormInst,
  NButton,
  NCard,
  NColorPicker,
  NDropdown,
  NForm,
  NFormItem,
  NIcon,
  NInput,
  NModal,
  NScrollbar,
  NSpace,
  NTag,
  NPopover
} from 'naive-ui';
import {
  BookOutline as BookIcon,
  BrushOutline as EditIcon,
  TrashOutline as TrashIcon
} from '@vicons/ionicons5';
import { Component, h, onMounted, reactive, ref } from 'vue';
import { addTag, allTags, delTagByIds, updateTag } from '../apis/tagApi.ts';
import { Tag } from '../models/Tag.ts';
import { confirmDialog, errorMsg, successMsg } from '../utils/Message.ts';
import { DialogFormMode } from '../models/enum/DialogFormMode.ts';

// 标签集合
const tags = ref<Array<Tag> | null>(null);

// 当前点击的菜单索引
const currentClickMenuIndex = ref(-1);

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

// 当前鼠标进入的标签的索引，用于在鼠标移到标签时，使标签更可视化
const currentMouseEnterTagIndex = ref(-1);

onMounted(() => {
  // 刷新标签数据
  refreshTags();
});

/**
 * 刷新标签数据
 */
const refreshTags = () => {
  allTags()
    .then((res) => {
      tags.value = res.data;
    })
    .catch((err) => {
      errorMsg(err);
    });
};

/**
 * 渲染图标
 */
function renderIcon(icon: Component) {
  return () => h(NIcon, null, { default: () => h(icon) });
}

/**
 * 标签菜单选择事件
 * @param key 菜单 key
 */
const onTagMenuSelect = (key: string) => {
  let currentTag = tags.value?.[currentClickMenuIndex.value]!!;
  switch (key) {
    case 'delete':
      // 删除标签
      confirmDialog(
        '确定要删除标签 [' + currentTag?.displayName + '] 吗？此操作不可逆。',
        () => {
          // 删除标签
          delTagByIds([currentTag?.tagId!!])
            .then(() => {
              // 删除成功
              successMsg('删除成功');
              // 刷新标签列表
              refreshTags();
            })
            .catch((err) => {
              errorMsg(err);
            });
        }
      );
      break;
    case 'edit':
      // 编辑标签
      // 清空添加修改标签对话框表单
      clearAddEditForm();
      // 将选择的标签数据加入对话框表单
      formAddEdit.tagId = currentTag.tagId!!;
      formAddEdit.displayName = currentTag.displayName;
      formAddEdit.slug = currentTag.slug;
      formAddEdit.color = currentTag.color ?? '';
      // 设置当前为编辑模式
      addEditMode.value = DialogFormMode.EDIT;
      // 显示对话框
      visibleAddEditDialog.value = true;
      break;
  }
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
          slug: formAddEdit.slug,
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
  if (addEditMode.value === DialogFormMode.ADD) {
    // 只有在添加模式，才同步修改别名
    formAddEdit.slug = value.toLowerCase();
  }
};

/**
 * 鼠标进入标签事件
 * 用于在鼠标进入标签后，使当前标签更加可视化
 */
const onTagMouseEnter = (index: number) => {
  // 将当前标签的索引保存到变量
  currentMouseEnterTagIndex.value = index;
};

/**
 * 鼠标离开标签事件
 */
const onTagMouseLeave = () => {
  // 将当前标签的索引清空
  currentMouseEnterTagIndex.value = -1;
};
</script>

<template>
  <div class="container">
    <!-- 添加 / 修改标签模态框 -->
    <n-modal
      v-model:show="visibleAddEditDialog"
      preset="dialog"
      :title="addEditMode == DialogFormMode.ADD ? '添加标签' : '修改标签'"
      :positive-text="addEditMode == DialogFormMode.ADD ? '添加' : '修改'"
      negative-text="取消"
      :loading="isAddEditDialogLoading"
      @positiveClick="onAddEditDialogSubmit"
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
              show-count
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
              show-count
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

    <n-card
      :title="(tags?.length ?? '0') + ' 个标签'"
      :segmented="{
        content: true
      }"
      content-style="padding: 0;"
      size="small"
    >
      <template #header-extra>
        <n-button type="primary" @click="onAddTagClick">添加标签</n-button>
      </template>
      <template #default>
        <n-scrollbar style="max-height: calc(100vh - 184px)">
          <div style="padding: 10px">
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
                        <n-tag
                          @mouseenter="onTagMouseEnter(index)"
                          @mouseleave="onTagMouseLeave"
                          class="tag transition"
                          size="small"
                          :color="
                            tag.color !== null &&
                            tag.color !== '' &&
                            currentMouseEnterTagIndex !== index
                              ? { textColor: tag.color, borderColor: tag.color }
                              : {}
                          "
                        >
                          <span
                            :class="
                              tag.color !== null &&
                              tag.color !== '' &&
                              currentMouseEnterTagIndex !== index
                                ? 'tag-text-shadow'
                                : ''
                            "
                            >{{ tag.displayName }}</span
                          >
                        </n-tag>
                      </n-dropdown>
                    </div>
                  </template>
                  <span>{{ tag.slug }}</span>
                </n-popover>
              </div>
            </n-space>
          </div>
        </n-scrollbar>
      </template>
      <template #action>所有标签</template>
    </n-card>
  </div>
</template>

<style scoped>
.tag {
  cursor: pointer;
}
.tag-text-shadow {
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.2);
}
</style>
