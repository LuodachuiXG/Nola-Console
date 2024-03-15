<script setup lang="ts">
import MyCard from '../components/component/MyCard.vue';
import { inject, onMounted, reactive, ref } from 'vue';
import { Link } from '../models/Link.ts';
import { StoreEnum } from '../models/enum/StoreEnum.ts';
import {
  FormInst,
  NButton,
  NDivider,
  NForm,
  NFormItem,
  NIcon,
  NInput,
  NInputNumber,
  NList,
  NModal,
  NScrollbar,
  NSelect,
  NSpace,
  NText
} from 'naive-ui';
import { AddOutline as AddIcon } from '@vicons/ionicons5';
import LinkListItem from '../components/item/LinkListItem.vue';
import { addLink, delLink, getLinks, updateLink } from '../apis/linkApi.ts';
import { LinkSort } from '../models/enum/LinkSort.ts';
import {
  confirmDialog,
  errorMsg,
  optionSuccessMsg,
  successMsg
} from '../utils/Message.ts';
import { Pager } from '../models/Pager.ts';
import { DialogFormMode } from '../models/enum/DialogFormMode.ts';
import { LinkRequest } from '../models/request/LinkRequest.ts';

const globalVars: GlobalVars = inject('globalVars')!!;

// 总链接数
const totalLinks = ref(0);
// 总页数
const totalPages = ref(0);
// 当前页数
const currentPage = ref(1);
// 每页条数
const pageSize = ref(10);
// 链接查询排序方式
const linkSort = ref<LinkSort | null>(null);
// 链接列表
const links = ref<Array<Link> | null>(null);

// 链接对话框引用
const linkDialogRef = ref<FormInst | null>(null);
// 是否显示添加 / 修改链接对话框
const visibleLinkDialog = ref(false);
// 链接对话框是否加载中
const isLinkDialogLoading = ref(false);
// 链接对话框模式，添加或修改
const dialogMode = ref<DialogFormMode>(DialogFormMode.ADD);
// 链接表单
const formLink: Link = reactive({
  linkId: -1,
  displayName: '',
  url: '',
  logo: '',
  description: '',
  priority: 0,
  remark: '',
  // 下面两个字段仅用于满足接口，无其他用处
  createTime: 0,
  lastModifyTime: null
});

// 链接排序下拉框选项
const linkSortSelectOptions = [
  {
    label: '优先级降序',
    value: LinkSort.PRIORITY_DESC
  },
  {
    label: '优先级升序',
    value: LinkSort.PRIORITY_ASC
  },
  {
    label: '创建时间降序',
    value: LinkSort.CREATE_TIME_DESC
  },
  {
    label: '创建时间升序',
    value: LinkSort.CREATE_TIME_ASC
  },
  {
    label: '修改时间降序',
    value: LinkSort.MODIFY_TIME_DESC
  },
  {
    label: '修改时间升序',
    value: LinkSort.MODIFY_TIME_ASC
  }
];

onMounted(() => {
  // 读取以前的设置
  loadSettings();
  // 刷新友情链接
  refreshLinks();
});

/**
 * 加载设置
 */
const loadSettings = () => {
  // 读取以前是否设置过每页大小
  pageSize.value = Number(localStorage.getItem(StoreEnum.LINK_PAGE_SIZE) ?? 10);
};

/**
 * 刷新友情链接
 */
const refreshLinks = () => {
  window.$loadingBar.start();
  getLinks(
    currentPage.value,
    pageSize.value,
    linkSort.value ?? LinkSort.PRIORITY_DESC
  )
    .then((res) => {
      window.$loadingBar.finish();
      let pager: Pager<Link> = res.data;
      currentPage.value = pager.page;
      pageSize.value = pager.size;
      totalLinks.value = pager.totalData;
      totalPages.value = pager.totalPages;
      links.value = pager.data;
    })
    .catch((err) => {
      window.$loadingBar.error();
      errorMsg(err);
    });
};

/**
 * 分页组件当前页改变事件
 * @param page 当前页
 */
const onPageUpdate = (page: number) => {
  currentPage.value = page;
  // 刷新友情链链接
  refreshLinks();
};

/**
 * 分页组件每页大小改变事件
 * @param size 每页大小
 */
const onPageSizeUpdate = (size: number) => {
  pageSize.value = size;
  // 将每页大小存储
  localStorage.setItem(StoreEnum.LINK_PAGE_SIZE, size.toString());
  // 刷新友情链链接
  refreshLinks();
};

/**
 * 添加链接按钮点击事件
 */
const onAddLinkClick = () => {
  // 清空表单
  clearLinkForm();
  // 设置当前是添加模式
  dialogMode.value = DialogFormMode.ADD;
  // 显示对话框
  visibleLinkDialog.value = true;
};

/**
 * 删除链接事件
 * @param link 链接
 */
const onDeleteLink = (link: Link) => {
  confirmDialog(`确定要删除链接 [${link.displayName}] 吗？`, () => {
    delLink([link.linkId])
      .then(() => {
        optionSuccessMsg();
        refreshLinks();
      })
      .catch((err) => errorMsg(err));
  });
};

/**
 * 编辑链接事件
 * @param link 链接
 */
const onSettingLink = (link: Link) => {
  // 先清空表单
  clearLinkForm();
  // 设置当前是编辑模式
  dialogMode.value = DialogFormMode.EDIT;
  // 将链接数据填入表单
  formLink.linkId = link.linkId;
  formLink.displayName = link.displayName;
  formLink.url = link.url;
  formLink.logo = link.logo;
  formLink.description = link.description;
  formLink.priority = link.priority;
  formLink.remark = link.remark;
  // 显示对话框
  visibleLinkDialog.value = true;
};

/**
 * 清空链接表单
 */
const clearLinkForm = () => {
  formLink.linkId = -1;
  formLink.displayName = '';
  formLink.url = '';
  formLink.logo = '';
  formLink.description = '';
  formLink.priority = 0;
  formLink.remark = '';
  formLink.createTime = 0;
  formLink.lastModifyTime = null;
};

/**
 * 链接对话框提交事件
 */
const onLinkDialogSubmit = () => {
  // 验证表单
  linkDialogRef.value?.validate((errors) => {
    if (!errors) {
      let linkRequest: LinkRequest = {
        linkId: formLink.linkId,
        displayName: formLink.displayName,
        url: formLink.url,
        logo: formLink.logo?.length === 0 ? null : formLink.logo,
        description:
          formLink.description?.length === 0 ? null : formLink.description,
        priority: formLink.priority,
        remark: formLink.remark?.length === 0 ? null : formLink.remark
      };

      if (dialogMode.value === DialogFormMode.ADD) {
        // 添加链接
        addLink(linkRequest)
          .then(() => {
            visibleLinkDialog.value = false;
            successMsg('添加成功');
            // 刷新链接
            refreshLinks();
          })
          .catch((err) => errorMsg(err));
      } else {
        // 修改链接
        updateLink(linkRequest)
          .then(() => {
            visibleLinkDialog.value = false;
            optionSuccessMsg();
            // 刷新链接
            refreshLinks();
          })
          .catch((err) => errorMsg(err));
      }
    }
  });
  return false;
};
</script>

<template>
  <div class="container">
    <!-- 添加 / 修改链接模态框 -->
    <n-modal
      v-model:show="visibleLinkDialog"
      preset="dialog"
      :title="dialogMode == DialogFormMode.ADD ? '添加链接' : '链接设置'"
      :positive-text="dialogMode == DialogFormMode.ADD ? '添加' : '保存'"
      negative-text="取消"
      :loading="isLinkDialogLoading"
      @positiveClick="onLinkDialogSubmit"
      @keydown.enter="onLinkDialogSubmit"
    >
      <template #default>
        <n-scrollbar style="max-height: 55vh; padding-right: 12px">
          <n-form
            ref="linkDialogRef"
            class="dialog-form"
            :model="formLink"
            style="margin: 10px 5px"
          >
            <n-form-item
              label="链接名"
              path="displayName"
              :rule="{ required: true, message: '请输入链接名' }"
            >
              <n-input
                v-model:value="formLink.displayName"
                placeholder="链接名"
                maxlength="100"
              />
            </n-form-item>
            <n-form-item
              label="地址"
              path="url"
              :rule="{ required: true, message: '请输入链接地址' }"
            >
              <n-input
                v-model:value="formLink.url"
                placeholder="链接地址"
                maxlength="256"
              />
            </n-form-item>
            <n-form-item label="Logo" path="logo">
              <n-input
                v-model:value="formLink.logo"
                placeholder="链接 LOGO"
                maxlength="256"
              />
            </n-form-item>
            <n-form-item label="描述" path="description">
              <n-input
                type="textarea"
                v-model:value="formLink.description"
                placeholder="链接描述"
                maxlength="400"
              />
            </n-form-item>

            <n-divider>
              <n-text depth="3" style="font-size: 0.9em">进阶设置</n-text>
            </n-divider>

            <n-form-item label="优先级（0 - 100）" path="priority">
              <n-input-number
                style="width: 100%"
                v-model:value="formLink.priority"
                placeholder="链接优先级（0 - 100）默认 0"
                clearable
                :max="100"
                :min="0"
              />
            </n-form-item>

            <n-form-item label="备注（仅后台可见）" path="remark">
              <n-input
                v-model:value="formLink.remark"
                placeholder="链接备注"
                maxlength="128"
              />
            </n-form-item>
          </n-form>
        </n-scrollbar>
      </template>
    </n-modal>

    <my-card
      :data-count="totalLinks"
      :show-empty-status="links !== null && links.length === 0"
      :current-page="currentPage"
      :page-size="pageSize"
      :page-count="totalPages"
      :current-page-item-count="links?.length ?? 0"
      show-pagination
      item-string="链接"
      @on-page-update="onPageUpdate"
      @on-page-size-update="onPageSizeUpdate"
    >
      <template #header-extra>
        <n-space>
          <n-select
            :options="linkSortSelectOptions"
            v-model:value="linkSort"
            @update:value="refreshLinks"
            style="width: 130px"
          />
          <n-button type="primary" @click="onAddLinkClick">
            <template #icon>
              <n-icon>
                <AddIcon />
              </n-icon>
            </template>
            <span v-if="!globalVars.isSmallWindow">添加链接</span>
          </n-button>
        </n-space>
      </template>
      <template #content>
        <!-- 链接列表 -->
        <div>
          <n-list hoverable>
            <link-list-item
              v-for="link in links"
              :link="link"
              @on-delete-link="onDeleteLink"
              @on-setting-link="onSettingLink"
            />
          </n-list>
        </div>
      </template>
    </my-card>
  </div>
</template>

<style scoped></style>
