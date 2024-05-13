<!-- 博客设置组件-->
<script setup lang="ts">
import { inject, onMounted, reactive, ref } from 'vue';
import { getBlogInfo, updateBlogInfo } from '../../apis/blogApi.ts';
import { errorMsg, successMsg } from '../../utils/Message.ts';
import { BlogInfo } from '../../models/BlogInfo.ts';
import {
  FormInst,
  NButton,
  NForm,
  NFormItem,
  NIcon,
  NInput,
  NInputGroup,
  NPopover,
  NScrollbar
} from 'naive-ui';
import { FileTrayFullOutline as FileIcon } from '@vicons/ionicons5';
import MyFileSelectModal from '../component/MyFileSelectModal.vue';
import { MFile } from '../../models/MFile.ts';
import { isImage } from '../../utils/MyUtils.ts';

const globalVars: GlobalVars = inject('globalVars')!!;

const formRef = ref<FormInst | null>(null);

const isLoading = ref(false);

const blogInfo = ref<BlogInfo | null>(null);
// 博客设置表单
const formBlogInfo = reactive<BlogInfo>({
  title: '',
  subtitle: '',
  blogger: null,
  logo: null,
  favicon: null,
  createDate: -1
});

// 是否显示选择文件模态框
const visibleFileSelectModal = ref(false);
// 当前是选择 LOGO 还是 Favicon
const selectFileType = ref<'logo' | 'favicon'>('logo');

onMounted(() => {
  initBlogInfo();
});

/**
 * 初始化博客信息
 */
const initBlogInfo = () => {
  getBlogInfo()
    .then((res) => {
      blogInfo.value = res.data;
      if (blogInfo.value) {
        clearForm();
        formBlogInfo.title = blogInfo.value?.title;
        formBlogInfo.subtitle = blogInfo.value?.subtitle;
        formBlogInfo.blogger = blogInfo.value?.blogger;
        formBlogInfo.logo = blogInfo.value?.logo;
        formBlogInfo.favicon = blogInfo.value?.favicon;
        formBlogInfo.createDate = blogInfo.value?.createDate;
      }
    })
    .catch((err) => errorMsg(err));
};

/**
 * 清空表单
 */
const clearForm = () => {
  formBlogInfo.title = '';
  formBlogInfo.subtitle = '';
  formBlogInfo.blogger = null;
  formBlogInfo.logo = null;
  formBlogInfo.favicon = null;
  formBlogInfo.createDate = -1;
};

/**
 * 处理选择 LOGO 附件事件
 */
const handleSelectLogo = () => {
  selectFileType.value = 'logo';
  visibleFileSelectModal.value = true;
};

/**
 * 处理选择 Favicon 附件事件
 */
const handleSelectFavicon = () => {
  selectFileType.value = 'favicon';
  visibleFileSelectModal.value = true;
};

/**
 * 选择附件确认事件
 * @param files 因为设置了不可多选，所以这里只会有一个文件
 */
const onCoverFileSelectConfirm = (files: Array<MFile>) => {
  let file = files[0];
  if (!isImage(file.displayName)) {
    // 当前选择的文件不是图片
    errorMsg('只能选择图片文件');
    return;
  }
  if (selectFileType.value === 'logo') {
    formBlogInfo.logo = file.url;
  } else if (selectFileType.value === 'favicon') {
    formBlogInfo.favicon = file.url;
  }
};

/**
 * 保存按钮点击事件
 */
const onSubmit = () => {
  formRef.value?.validate((errors) => {
    if (!errors) {
      isLoading.value = true;
      updateBlogInfo(
        formBlogInfo.title,
        formBlogInfo.subtitle,
        formBlogInfo.logo,
        formBlogInfo.favicon
      )
        .then(() => {
          successMsg('保存成功');
          isLoading.value = false;
        })
        .catch((err) => {
          errorMsg(err);
          isLoading.value = false;
        });
    }
  });
  return false;
};
</script>

<template>
  <!-- 选择附件对话框 -->
  <my-file-select-modal
    v-model:show="visibleFileSelectModal"
    :multiple="false"
    @on-confirm="onCoverFileSelectConfirm"
  />

  <n-scrollbar style="max-height: calc(100vh - 245px);">
    <n-form
      ref="formRef"
      class="form"
      :model="formBlogInfo"
      :style="{ width: globalVars.isSmallWindow ? '95%' : '40vw' }"
    >
      <n-form-item
        label="站点标题"
        path="title"
        :rule="{ required: true, message: '请输入站点标题' }"
      >
        <n-input
          v-model:value="formBlogInfo.title"
          clearable
          placeholder="站点标题"
        />
      </n-form-item>
      <n-form-item label="站点副标题" path="subtitle">
        <n-input
          v-model:value="formBlogInfo.subtitle"
          clearable
          placeholder="站点副标题"
        />
      </n-form-item>
      <n-form-item path="logo" label="LOGO">
        <n-input-group>
          <n-input
            placeholder="LOGO"
            v-model:value="formBlogInfo.logo"
            clearable
          />
          <n-popover>
            <template #trigger>
              <n-button @click="handleSelectLogo">
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
      <n-form-item path="favicon" label="Favicon">
        <n-input-group>
          <n-input
            placeholder="Favicon"
            v-model:value="formBlogInfo.favicon"
            clearable
          />
          <n-popover>
            <template #trigger>
              <n-button @click="handleSelectFavicon">
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
    </n-form>
  </n-scrollbar>
  <div class="btn-div">
    <n-button type="primary" @click="onSubmit" :loading="isLoading">
      保存
    </n-button>
  </div>
</template>

<style scoped>
.form {
  margin-top: 10px;
  padding: 5px;
}

.btn-div {
  margin-top: 10px;
  padding: 0 0 5px 5px
}
</style>
