<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import { getBlogInfo, initBlogInfo, createBlogAdmin } from '../apis/blogApi.ts';
import { login } from '../apis/userApi.ts';
import { BlogInfo } from '../models/BlogInfo.ts';
import router from '../router';
import { RouterViews } from '../router/RouterViews.ts';
import {
  NForm,
  NFormItem,
  NInput,
  NButton,
  FormInst,
  FormItemRule
} from 'naive-ui';
import { errorMsg, successMsg } from '../utils/Message.ts';
import { formatTimestamp } from '../utils/MyUtils.ts';
import { useUserStore } from '../stores/UserStore.ts';

/**
 * 标记当前模式的枚举类
 */
enum Mode {
  // 登录
  LOGIN,
  // 创建博客
  CREATE_BLOG,
  // 创建管理员
  CREATE_ADMIN
}

// 用户 Store
const userStore = useUserStore();

// 当前模式
const currentMode = ref(Mode.LOGIN);

// 博客信息
const blogInfo = ref<BlogInfo | null>();

// 登录表单引用
const formLoginRef = ref<FormInst | null>(null);
// 登录表单
const formLogin = reactive({
  username: '',
  password: ''
});
// 是否正在请求登录
const isLogin = ref(false);

// 初始化博客表单引用
const formCreateBlogRef = ref<FormInst | null>(null);
// 初始化博客表单
const formCreateBlog = reactive({
  title: '',
  subtitle: ''
});
// 是否正在请求初始化博客
const isCreateBlog = ref(false);

// 创建管理员表单引用
const formCreateAdminRef = ref<FormInst | null>(null);
// 创建管理员表单
const formCreateAdmin = reactive({
  username: '',
  displayName: '',
  email: '',
  password: '',
  passwordA: ''
});
// 是否正在请求创建管理员
const isCreateAdmin = ref(false);



onMounted(() => {
  // 刷新博客信息
  refreshBlogInfo();
  // 添加键盘监听器
  document.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  // 移除键盘监听器
  document.removeEventListener('keydown', handleKeyDown);
  
});


/**
 * 按键监听事件
 * @param event
 */
function handleKeyDown(event: KeyboardEvent) {
  // 判断是否是回车
  if (event.key === 'Enter') {
    // 根据当前不同模式，触发不同事件
    switch (currentMode.value) {
      case Mode.LOGIN:
        // 当前是登录模式
        onFormLoginSubmit();
        break;
      case Mode.CREATE_ADMIN:
        // 当前是创建管理员模式
        onFormCreateAdminSubmit();
        break;
      case Mode.CREATE_BLOG:
        // 当前是创建博客模式
        onFormCreateBlogSubmit();
        break;
    }
  }
}

/**
 * 刷新博客信息
 */
const refreshBlogInfo = () => {
  getBlogInfo()
    .then((res) => {
      blogInfo.value = res.data as BlogInfo;
      if (blogInfo.value === null) {
        // 博客未初始化，创建博客模式
        currentMode.value = Mode.CREATE_BLOG;
      } else if (blogInfo.value?.blogger === null) {
        // 管理员未创建，创建管理员模式
        currentMode.value = Mode.CREATE_ADMIN;
      } else {
        // 登录模式
        currentMode.value = Mode.LOGIN;
      }
    })
    .catch((err) => {
      errorMsg('获取博客信息失败，' + err);
    });
};

/**
 * 初始化博客表单提交事件
 */
const onFormCreateBlogSubmit = () => {
  // 验证表单
  formCreateBlogRef.value
    ?.validate((errors) => {
      if (!errors) {
        isCreateBlog.value = true;
        // 初始化博客
        initBlogInfo(formCreateBlog.title, formCreateBlog.subtitle)
          .then(() => {
            // 初始化成功，刷新博客信息
            successMsg('博客初始化成功');
            refreshBlogInfo();
            isCreateBlog.value = false;
          })
          .catch((err) => {
            errorMsg(err);
            isCreateBlog.value = false;
          });
      }
    })
    .catch(() => {});
};

/**
 * 创建管理员表单提交事件
 */
const onFormCreateAdminSubmit = () => {
  // 验证表单
  formCreateAdminRef.value
    ?.validate((errors) => {
      if (!errors) {
        isCreateAdmin.value = true;
        // 创建管理员
        createBlogAdmin(
          formCreateAdmin.username,
          formCreateAdmin.displayName,
          formCreateAdmin.email,
          formCreateAdmin.password
        )
          .then((res) => {
            if (res.data) {
              // 创建管理员成功，刷新博客信息
              successMsg('管理员创建成功');
              refreshBlogInfo();
            } else {
              errorMsg('创建管理员失败，请查看后台日志');
            }
            isCreateAdmin.value = false;
          })
          .catch((err) => {
            errorMsg(err);
            isCreateAdmin.value = false;
          });
      }
    })
    .catch(() => {});
};

/**
 * 登录表单登录事件
 */
const onFormLoginSubmit = () => {
  // 验证表单是否有错误
  formLoginRef.value
    ?.validate((errors) => {
      if (!errors) {
        isLogin.value = true;
        // 登录
        login(formLogin.username, formLogin.password)
          .then((res) => {
            // 登录成功
            // 将返回的用户信息和 Token 令牌存储
            userStore.login(res.data);
            setTimeout(() => {
              console.log(userStore.getUser);
            }, 1000)

            if (!userStore.getUser?.lastLoginDate) {
              successMsg('欢迎使用 Nola 博客 ^_^');
            } else {
              successMsg(
                `上次登录时间：${formatTimestamp(userStore.getUser.lastLoginDate)}`
              );
            }
            // 跳转控制台页面
            router.push(RouterViews.MAIN.name);
            isLogin.value = false;
          })
          .catch((err) => {
            // 登录失败
            errorMsg(err);
            isLogin.value = false;
          });
      }
    })
    .catch(() => {});
};

/**
 * 验证创建管理员重复密码是否相同
 */
const validatePasswordSame = (_: FormItemRule, value: string) => {
  return value === formCreateAdmin.password;
};
</script>

<template>
  <div
    class="container"
    :style="currentMode === Mode.CREATE_ADMIN ? 'margin-top:0;' : ''"
  >
    <img class="logo" src="../assets/nola.png" alt="Nola" /><br />
    <!-- 登录博客 -->
    <n-form
      v-if="currentMode === Mode.LOGIN"
      ref="formLoginRef"
      class="form"
      :model="formLogin"
      :show-label="false"
    >
      <n-form-item
        path="username"
        :rule="{ required: true, message: '请输入用户名' }"
      >
        <n-input
          v-model:value="formLogin.username"
          placeholder="用户名"
          @keydown.enter.prevent
        />
      </n-form-item>
      <n-form-item
        path="password"
        :rule="{ required: true, message: '请输入密码' }"
      >
        <n-input
          v-model:value="formLogin.password"
          placeholder="密码"
          type="password"
          show-password-on="click"
          @keydown.enter.prevent
        />
      </n-form-item>
      <n-form-item>
        <n-button
          type="primary"
          @click="onFormLoginSubmit"
          style="width: 100%"
          :loading="isLogin"
          >登录
        </n-button>
      </n-form-item>
    </n-form>

    <!-- 初始化博客 -->
    <n-form
      v-if="currentMode === Mode.CREATE_BLOG"
      ref="formCreateBlogRef"
      class="form"
      :model="formCreateBlog"
      :show-label="false"
    >
      <n-form-item
        path="title"
        :rule="{ required: true, message: '请输入站点标题' }"
      >
        <n-input
          v-model:value="formCreateBlog.title"
          placeholder="站点标题"
          @keydown.enter.prevent
        />
      </n-form-item>
      <n-form-item path="subtitle">
        <n-input
          v-model:value="formCreateBlog.subtitle"
          placeholder="站点副标题（可选）"
          @keydown.enter.prevent
        />
      </n-form-item>

      <n-form-item>
        <n-button
          type="primary"
          @click="onFormCreateBlogSubmit"
          style="width: 100%"
          :loading="isCreateBlog"
        >
          初始化博客
        </n-button>
      </n-form-item>
    </n-form>

    <!-- 创建管理员 -->
    <n-form
      v-if="currentMode === Mode.CREATE_ADMIN"
      ref="formCreateAdminRef"
      class="form"
      :model="formCreateAdmin"
      :show-label="false"
    >
      <n-form-item
        path="username"
        :rule="[
          { required: true, message: '请输入用户名' },
          { min: 4, message: '用户名不能小于 4 位', trigger: 'blur' }
        ]"
      >
        <n-input
          v-model:value="formCreateAdmin.username"
          placeholder="用户名"
          @keydown.enter.prevent
        />
      </n-form-item>

      <n-form-item
        path="displayName"
        :rule="{ required: true, message: '请输入显示名称' }"
      >
        <n-input
          v-model:value="formCreateAdmin.displayName"
          placeholder="显示名称"
          @keydown.enter.prevent
        />
      </n-form-item>

      <n-form-item
        path="email"
        :rule="[
          { required: true, message: '请输入邮箱' },
          { type: 'email', message: '邮箱不正确', trigger: 'blur' }
        ]"
      >
        <n-input
          v-model:value="formCreateAdmin.email"
          placeholder="邮箱"
          @keydown.enter.prevent
        />
      </n-form-item>

      <n-form-item
        path="password"
        :rule="[
          { required: true, message: '请输入密码' },
          { min: 8, message: '密码不能小于 8 位', trigger: 'blur' }
        ]"
      >
        <n-input
          v-model:value="formCreateAdmin.password"
          type="password"
          show-password-on="click"
          placeholder="密码"
          @keydown.enter.prevent
        />
      </n-form-item>

      <n-form-item
        path="passwordA"
        :rule="[
          { required: true, message: '请输入密码' },
          {
            validator: validatePasswordSame,
            message: '两次密码不一致',
            trigger: 'blur'
          }
        ]"
      >
        <n-input
          v-model:value="formCreateAdmin.passwordA"
          type="password"
          show-password-on="click"
          placeholder="重复密码"
          @keydown.enter.prevent
        />
      </n-form-item>
      <n-form-item>
        <n-button
          type="primary"
          @click="onFormCreateAdminSubmit"
          style="width: 100%"
          :loading="isCreateAdmin"
        >
          创建管理员
        </n-button>
      </n-form-item>
    </n-form>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  height: 100%;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  margin-top: 8vh;
}

.logo {
  width: 90px;
  height: 90px;
}

.form {
  width: 300px;
}
</style>
