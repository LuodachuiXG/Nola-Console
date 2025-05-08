<!-- 重新登录对话框 -->
<script lang="ts" setup>
import { NForm, NFormItem, NModal, NInput, FormInst } from 'naive-ui';
import { confirmDialog, successMsg } from '../../utils/Message';
import { reactive, ref } from 'vue';
import { login } from '../../apis/userApi';
import { useRouter } from 'vue-router';
import { useUserStore } from '../../stores/UserStore';
import { RouterViews } from '../../router/RouterViews';

const show = defineModel('show', {
  default: false,
  type: Boolean,
  required: true
});

// 用户 Store
const userStore = useUserStore();

// 重新登录对话框是否加载中
const isReLoginLoading = ref(false);

// 重新登录对话框表单引用
const formRef = ref<FormInst | null>(null);

// 重新登录对话框表单
const form = reactive({
  username: '',
  password: ''
});

const router = useRouter();

/**
 * 重新登录对话框，返回登录页按钮点击事件
 */
const onReLoginDialogCancelClick = () => {
  confirmDialog('确定要返回登录页吗？未保存的内容将丢失！', () => {
    // 隐藏重新登录对话框
    show.value = false;
    // 清空重新登录对话框表单内容
    clearReLoginForm();
    // 清空登录记录
    userStore.logout();
    // 返回登录页
    router.push(RouterViews.LOGIN.name);
  });
  return false;
};

/**
 * 重新登录对话框，登录按钮点击事件
 */
function onReLoginDialogLoginClick() {
  // 验证表单是否有错误
  formRef.value
    ?.validate((errors) => {
      if (!errors) {
        isReLoginLoading.value = true;
        // 登录
        login(form.username, form.password)
          .then((res) => {
            // 登录成功
            // 将返回的用户信息和 Token 令牌存储
            userStore.login(res.data);
            isReLoginLoading.value = false;
            // 关闭重新登录对话框显示
            show.value = false;
            // 清空重新登录对话框表单
            clearReLoginForm();
            successMsg('登录成功');

            // 刷新一下当前页面
          })
          .catch(() => {
            // 登录失败
            isReLoginLoading.value = false;
          });
      }
    })
    .catch(() => {});

  return false;
}

/**
 * 清空重新登录对话框表单内容
 */
const clearReLoginForm = () => {
  form.username = '';
  form.password = '';
};
</script>

<template>
  <n-modal
    ref="reLoginDialog"
    v-model:show="show"
    preset="dialog"
    title="登录过期，重新登录"
    positive-text="登录"
    negative-text="返回登录页"
    :mask-closable="false"
    :close-on-esc="false"
    :closable="false"
    :loading="isReLoginLoading"
    @positiveClick="onReLoginDialogLoginClick"
    @negativeClick="onReLoginDialogCancelClick"
    @keydown.enter="onReLoginDialogLoginClick"
  >
    <template #default>
      <n-form
        ref="formRef"
        class="dialog-form"
        :model="form"
        :show-label="false"
      >
        <n-form-item
          path="username"
          :rule="{ required: true, message: '请输入用户名' }"
        >
          <n-input
            v-model:value="form.username"
            placeholder="用户名"
            @keydown.enter.prevent
          />
        </n-form-item>
        <n-form-item
          path="password"
          :rule="{ required: true, message: '请输入密码' }"
        >
          <n-input
            v-model:value="form.password"
            placeholder="密码"
            type="password"
            show-password-on="mousedown"
            @keydown.enter.prevent
          />
        </n-form-item>
      </n-form>
    </template>
  </n-modal>
</template>

<style></style>
