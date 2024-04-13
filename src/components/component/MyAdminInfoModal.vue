<!-- 管理员个人信息模态框 -->
<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
import {
  NForm,
  NFormItem,
  NInput,
  NModal,
  FormInst,
  NScrollbar,
  NIcon,
  NImage,
  NSpace,
  NButton,
  NPopover,
  NInputGroup
} from 'naive-ui';
import { User } from '../../models/User.ts';
import { formatTimestamp, isImage } from '../../utils/MyUtils.ts';
import { getUserInfo, updateUserInfo } from '../../apis/userApi.ts';
import { errorMsg, optionSuccessMsg } from '../../utils/Message.ts';
import { StoreEnum } from '../../models/enum/StoreEnum.ts';
import { FileTrayFullOutline as FileIcon } from '@vicons/ionicons5';
import MyFileSelectModal from './MyFileSelectModal.vue';
import { MFile } from '../../models/MFile.ts';

// 组件参数。是否显示对话框
const show = defineModel('show', {
  default: false,
  type: Boolean,
  required: true
});

const emit = defineEmits<{
  (e: 'onClose'): void;
}>();

const formRef = ref<FormInst | null>(null);

// 控制模态框是否显示
const _show = ref(false);

// 是否正在加载中
const isLoading = ref(false);

// 是否显示选择文件模态框
const visibleFileSelectModal = ref(false);

// 管理员信息表单
const form = reactive({
  username: '',
  email: '',
  displayName: '',
  description: '',
  avatar: '',
  createDate: '',
  lastLoginDate: ''
});

onMounted(() => {
  // 检测组件 show 参数
  watch(
    () => show.value,
    () => {
      if (show.value) {
        // 获取管理员用户信息
        refreshUserInfo();
      }
    }
  );
});

/**
 * 刷新管理员信息
 */
const refreshUserInfo = () => {
  // 先清空表单
  clearForm();
  getUserInfo()
    .then((res) => {
      const user = res.data as User;
      // 填充表单
      fillForm(user);
      // 显示对话框
      _show.value = true;
    })
    .catch((err) => {
      show.value = false;
      errorMsg(err);
    });
};

/**
 * 填充表单
 * @param user 用户接口
 */
const fillForm = (user: User) => {
  form.username = user.username;
  form.email = user.email;
  form.displayName = user.displayName;
  form.description = user.description ?? '';
  form.avatar = user.avatar ?? '';
  form.createDate = formatTimestamp(user.createDate);
  form.lastLoginDate =
    user.lastLoginDate === null ? '' : formatTimestamp(user.lastLoginDate);
};

/**
 * 清空表单
 */
const clearForm = () => {
  form.username = '';
  form.email = '';
  form.displayName = '';
  form.description = '';
  form.avatar = '';
  form.createDate = '';
  form.lastLoginDate = '';
};

/**
 * 关闭模态框事件
 */
const onClose = () => {
  _show.value = false;
  show.value = false;
  emit('onClose');
};

/**
 * 表单提交事件
 */
const onSubmit = () => {
  formRef.value?.validate((errors) => {
    if (!errors) {
      isLoading.value = true;
      updateUserInfo(
        form.username,
        form.email,
        form.displayName,
        form.description.length === 0 ? null : form.description,
        form.avatar.length === 0 ? null : form.avatar
      )
        .then(() => {
          isLoading.value = false;
          // 修改成功
          optionSuccessMsg();
          // 同步修改本地缓存
          const user = JSON.parse(
            localStorage.getItem(StoreEnum.USER)!!
          ) as User;
          user.avatar = form.avatar;
          user.description = form.description;
          user.displayName = form.displayName;
          user.email = form.email;
          user.username = form.username;
          localStorage.setItem(StoreEnum.USER, JSON.stringify(user));
          // 关闭模态框
          onClose();
        })
        .catch((err) => {
          isLoading.value = false;
          errorMsg(err);
        });
    }
  });
  return false;
};

/**
 * 选择头像文件确认事件
 * @param files 因为设置了不可多选，所以这里只会有一个文件
 */
const onCoverFileSelectConfirm = (files: Array<MFile>) => {
  let file = files[0];
  if (!isImage(file.displayName)) {
    // 当前选择的文件不是图片
    errorMsg('只能选择图片文件');
    return;
  }
  form.avatar = file.url;
};
</script>

<template>
  <!-- 选择头像对话框 -->
  <my-file-select-modal
    v-model:show="visibleFileSelectModal"
    :multiple="false"
    @on-confirm="onCoverFileSelectConfirm"
  />


  <!-- 管理员个人信息模态框 -->
  <n-modal
    v-model:show="_show"
    preset="dialog"
    title="个人信息"
    positive-text="保存"
    negative-text="取消"
    :loading="isLoading"
    @maskClick="onClose"
    @close="onClose"
    @positiveClick="onSubmit"
    @negativeClick="onClose"
    @keydown.enter="onSubmit"
  >
    <template #default>
      <n-scrollbar style="max-height: 70vh; padding-right: 12px">
        <n-form
          ref="formRef"
          class="dialog-form"
          :model="form"
          style="margin: 10px 5px"
        >
          <n-form-item
            path="username"
            label="用户名"
            :rule="{ required: true, message: '请输入用户名' }"
          >
            <n-input
              placeholder="用户名"
              v-model:value="form.username"
              clearable
            />
          </n-form-item>

          <n-form-item
            path="email"
            label="邮箱"
            :rule="{ required: true, message: '请输入邮箱' }"
          >
            <n-input placeholder="邮箱" v-model:value="form.email" clearable />
          </n-form-item>

          <n-form-item
            path="displayName"
            label="显示名称"
            :rule="{ required: true, message: '请输入名称' }"
          >
            <n-input
              placeholder="显示名称"
              v-model:value="form.displayName"
              clearable
            />
          </n-form-item>

          <n-form-item path="avatar" label="头像">
            <n-space vertical style="width: 100%">
              <n-input-group>
                <n-input
                  placeholder="头像地址"
                  v-model:value="form.avatar"
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
                v-if="form.avatar"
                :src="form.avatar"
              />
            </n-space>
          </n-form-item>

          <n-form-item path="description" label="描述">
            <n-input
              placeholder="个人描述"
              v-model:value="form.description"
              type="textarea"
              clearable
            />
          </n-form-item>

          <n-form-item path="createDate" label="创建日期">
            <n-input v-model:value="form.createDate" readonly />
          </n-form-item>

          <n-form-item path="lastLoginDate" label="最后登录">
            <n-input v-model:value="form.lastLoginDate" readonly />
          </n-form-item>
        </n-form>
      </n-scrollbar>
    </template>
  </n-modal>
</template>

<style scoped></style>
