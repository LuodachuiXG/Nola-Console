<!-- 管理员修改密码模态框 -->
<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
import {
  NForm,
  NFormItem,
  NInput,
  NModal,
  FormInst,
  FormItemRule
} from 'naive-ui';
import { updateUserPassword } from '../../apis/userApi.ts';
import { errorMsg, optionSuccessMsg } from '../../utils/Message.ts';

// 组件参数。是否显示对话框
const show = defineModel('show', {
  default: false,
  type: Boolean,
  required: true
});

const formRef = ref<FormInst | null>(null);

// 控制模态框是否显示
const _show = ref(false);

// 是否正在加载中
const isLoading = ref(false);

// 密码表单
const form = reactive({
  password: '',
  confirmPassword: ''
});

onMounted(() => {
  // 检测组件 show 参数
  watch(
    () => show.value,
    () => {
      if (show.value) {
        // 显示模态框
        clearForm();
        _show.value = true;
      }
    }
  );
});

/**
 * 清空表单
 */
const clearForm = () => {
  form.password = '';
  form.confirmPassword = '';
};

/**
 * 关闭模态框事件
 */
const onClose = () => {
  _show.value = false;
  show.value = false;
};

/**
 * 表单提交事件
 */
const onSubmit = () => {
  formRef.value
    ?.validate((errors) => {
      if (!errors) {
        isLoading.value = true;
        updateUserPassword(form.password)
          .then(() => {
            // 密码修改成功
            // 关闭模态框
            optionSuccessMsg();
            isLoading.value = false;
            onClose();
          })
          .catch((err) => {
            isLoading.value = false;
            errorMsg(err);
          });
      }
    })
    .catch(() => {});
  return false;
};

/**
 * 验证重复密码是否相同
 */
const validatePasswordSame = (_: FormItemRule, value: string) => {
  return value === form.password;
};
</script>

<template>
  <!-- 修改密码模态框 -->
  <n-modal
    v-model:show="_show"
    preset="dialog"
    title="修改密码"
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
      <n-form ref="formRef" class="dialog-form" :model="form">
        <n-form-item
          path="password"
          label="新密码"
          :rule="[
            { required: true, message: '请输入新密码' },
            { min: 8, message: '密码不能小于 8 位', trigger: 'blur' }
          ]"
        >
          <n-input
            placeholder="请输入新密码"
            v-model:value="form.password"
            clearable
            type="password"
            show-password-on="click"
          />
        </n-form-item>

        <n-form-item
          path="confirmPassword"
          label="重复密码"
          :rule="[
            {
              validator: validatePasswordSame,
              message: '两次密码不一致',
              trigger: 'blur'
            }
          ]"
          required
        >
          <n-input
            placeholder="请输入重复密码"
            v-model:value="form.confirmPassword"
            clearable
            type="password"
            show-password-on="click"
          />
        </n-form-item>
      </n-form>
    </template>
  </n-modal>
</template>

<style scoped></style>
