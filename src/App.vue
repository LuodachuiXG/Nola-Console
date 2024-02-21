<script setup lang="ts">
import {
  Component,
  onMounted,
  ref,
  watch,
  h,
  reactive,
  onUnmounted
} from 'vue';
import { RouteLocationNormalizedLoaded, useRoute } from 'vue-router';
import { RouterViews } from './router/RouterViews.ts';
import {
  NIcon,
  NLayout,
  NLayoutContent,
  NLayoutHeader,
  NLayoutSider,
  NMenu,
  NCol,
  NRow,
  NConfigProvider,
  NButton,
  NImage,
  NSpace,
  NDropdown,
  NModal,
  darkTheme,
  zhCN,
  dateZhCN,
  NForm,
  NInput,
  NFormItem,
  FormInst
} from 'naive-ui';
import {
  BarChartOutline as BarChartIcon,
  LibraryOutline as CategoryIcon,
  BookOutline as BookIcon,
  PricetagsOutline as TagIcon,
  MoonOutline as MoonIcon,
  SunnyOutline as SunIcon,
  ChatboxOutline as CommentIcon,
  FileTrayFullOutline as FileIcon,
  AtOutline as AtIcon,
  MenuOutline as MenuIcon,
  SettingsOutline as SettingIcon,
  SaveOutline as BackUpIcon,
  ServerOutline as SystemIcon,
  PersonCircleOutline as PersonIcon,
  ExitOutline as ExitIcon,
  LockClosedOutline as LockIcon,
  LeafOutline as DailyIcon
} from '@vicons/ionicons5';
import themeOverrides from './theme/theme.ts';
import type { BuiltInGlobalTheme } from 'naive-ui/es/themes/interface';
import { getCurrentTheme, setTheme } from './utils/MyUtils.ts';
import AppProvider from './components/AppProvider/AppProvider.vue';
import { StoreEnum } from './models/enum/StoreEnum.ts';
import NolaIcon from './assets/nola.png';
import { User } from './models/User.ts';
import router from './router';
import { confirmDialog, errorMsg, successMsg } from './utils/Message.ts';
import bus from './utils/EventBus.ts';
import { login } from './apis/userApi.ts';

// 当前登录用户
const user = ref<User | null>(null);

// 当前主题颜色
const currentTheme = ref<BuiltInGlobalTheme | undefined>();

// 当前路由线路
const route = useRoute();

// 是否隐藏左侧菜单
const hideSider = ref(true);

// 侧边栏是否折叠
const isSiderCollapsed = ref(true);
// 用户是否手动修改过侧边栏
// 如果修改过，就不再根据窗口宽度自动折叠侧边栏
const isManualUpdateSider = ref(false);

// 标记当前是否是小窗（手机模式）
const isSmallWindow = ref(false);

// 重新登录对话框表单引用
const formReLoginRef = ref<FormInst | null>(null);
// 是否显示重新登录对话框，用于登录过期时快捷重新登录
const visibleReLoginDialog = ref(false);
// 重新登录对话框是否加载中
const isReLoginLoading = ref(false);
// 重新登录对话框表单
const formReLogin = reactive({
  username: '',
  password: ''
});

// 左侧菜单选项
const menuOptions = [
  {
    label: RouterViews.MAIN.menuName,
    key: RouterViews.MAIN.name,
    icon: renderIcon(BarChartIcon)
  },
  {
    type: 'divider'
  },
  {
    label: RouterViews.POST.menuName,
    key: RouterViews.POST.name,
    icon: renderIcon(BookIcon)
  },
  {
    label: RouterViews.TAG.menuName,
    key: RouterViews.TAG.name,
    icon: renderIcon(TagIcon)
  },
  {
    label: RouterViews.CATEGORY.menuName,
    key: RouterViews.CATEGORY.name,
    icon: renderIcon(CategoryIcon)
  },
  {
    label: RouterViews.COMMENT.menuName,
    key: RouterViews.COMMENT.name,
    icon: renderIcon(CommentIcon)
  },
  {
    label: RouterViews.DAILY.menuName,
    key: RouterViews.DAILY.name,
    icon: renderIcon(DailyIcon)
  },
  {
    label: RouterViews.ATTACHMENT.menuName,
    key: RouterViews.ATTACHMENT.name,
    icon: renderIcon(FileIcon)
  },
  {
    label: RouterViews.LINK.menuName,
    key: RouterViews.LINK.name,
    icon: renderIcon(AtIcon)
  },
  {
    label: RouterViews.MENU.menuName,
    key: RouterViews.MENU.name,
    icon: renderIcon(MenuIcon)
  },
  {
    type: 'divider'
  },
  {
    label: RouterViews.SETTING.menuName,
    key: RouterViews.SETTING.name,
    icon: renderIcon(SettingIcon)
  },
  {
    label: RouterViews.BACKUP.menuName,
    key: RouterViews.BACKUP.name,
    icon: renderIcon(BackUpIcon)
  },
  {
    label: RouterViews.SYSTEM.menuName,
    key: RouterViews.SYSTEM.name,
    icon: renderIcon(SystemIcon)
  }
];

// 头像点击弹出菜单
const avatarOptions = [
  {
    label: '管理员信息',
    key: 'admin_info',
    icon: renderIcon(PersonIcon)
  },
  {
    label: '修改密码',
    key: 'update_password',
    icon: renderIcon(LockIcon)
  },
  {
    type: 'divider'
  },
  {
    label: '注销',
    key: 'logout',
    icon: renderIcon(ExitIcon)
  }
];

onMounted(() => {
  // 获取之前设置的主题颜色
  currentTheme.value = getCurrentTheme() === 'dark' ? darkTheme : undefined;
  // 获取之前侧边栏折叠状态
  isSiderCollapsed.value =
    localStorage.getItem(StoreEnum.SIDER_COLLAPSED) === 'true';

  // 监听路由变化
  watch(route, (e: RouteLocationNormalizedLoaded) => {
    // 如果当前是登录页面，就隐藏侧边菜单
    hideSider.value = e.name === RouterViews.LOGIN.name;

    // 刷新当前登录用户
    let _user = localStorage.getItem(StoreEnum.USER);
    if (_user !== null) {
      user.value = JSON.parse(_user) as User;
    } else {
      user.value = null;
    }
  });

  // 添加窗口大小改变事件监听器，动态修改侧边栏是否展开
  window.addEventListener('resize', handlerWindowResize);
  handlerWindowResize();

  // 监听事件总线中登录过期消息
  bus.on('loginExpired', () => {
    // 收到登录过期消息，显示重新登录对话框
    visibleReLoginDialog.value = true;
  });
});

onUnmounted(() => {
  // 移除窗口大小改变监听器
  window.removeEventListener('resize', handlerWindowResize);
});

/**
 * 窗口大小改变监听器
 * 因窗口大小改变导致的侧边栏改变，侧边栏折叠配置不存储到本地
 */
const handlerWindowResize = () => {
  let width = window.document.documentElement.clientWidth;
  if (!isManualUpdateSider.value) {
    // 如果用户之前没有手动修改过侧边栏
    // 这里就根据窗口大小自动改变侧边栏状态
    isSmallWindow.value = width < 768;
    isSiderCollapsed.value = isSmallWindow.value;
  }
};

/**
 * 渲染图标
 */
function renderIcon(icon: Component) {
  return () => h(NIcon, null, { default: () => h(icon) });
}

/**
 * 主题切换事件
 */
const onSwitchTheme = () => {
  if (currentTheme.value !== undefined) {
    currentTheme.value = undefined;
    setTheme('light');
  } else {
    currentTheme.value = darkTheme;
    setTheme('dark');
  }
};

/**
 * 侧边栏折叠事件
 */
const onSiderCollapsed = (collapsed: boolean) => {
  let width = window.document.documentElement.clientWidth;
  // 下面的代码简要来说，如果用户在小窗下展开侧边栏，或者，是在大窗下折叠侧边栏（反向操作）
  // 则认为用户手动修改了侧边栏状态，即不再根据窗口大小自动折叠侧边栏。
  // 如果用户在小窗下折叠侧边栏，大窗下展开侧边栏（正向操作），
  // 则认为用户还是希望根据窗口大小修改侧边栏，所以设置 isManualUpdateSider = false，恢复侧边栏自适应。
  if (width <= 768 && isManualUpdateSider.value && collapsed) {
    isManualUpdateSider.value = false;
  } else
    isManualUpdateSider.value = !(
      width > 768 &&
      isManualUpdateSider.value &&
      !collapsed
    );

  // 修改侧边栏折叠状态
  isSiderCollapsed.value = collapsed;
  // 将侧边栏折叠状态存储到本地
  localStorage.setItem(
    StoreEnum.SIDER_COLLAPSED,
    String(isSiderCollapsed.value)
  );
};

/**
 * 侧边栏菜单项改变事件
 */
const onSiderMenuUpdate = (key: string) => {
  // 跳转页面
  router.push(key);
};

/**
 * 处理头像下拉菜单选择事件
 */
const onAvatarSelect = (key: string | number) => {
  switch (key) {
    case 'logout':
      // 弹出确认对话框
      confirmDialog('确定要注销登录吗', () => {
        // 删除登录用户信息
        localStorage.removeItem(StoreEnum.USER);
        // 跳转登录页
        router.push(RouterViews.LOGIN.name);
      });
      break;
  }
};

/**
 * 清空重新登录对话框表单内容
 */
const clearReLoginForm = () => {
  formReLogin.username = '';
  formReLogin.password = '';
};

/**
 * 重新登录对话框，返回登录页按钮点击事件
 */
const onReLoginDialogCancelClick = () => {
  confirmDialog('确定要返回登录页吗？未保存的内容将丢失！', () => {
    // 隐藏重新登录对话框
    visibleReLoginDialog.value = false;
    // 清空重新登录对话框表单内容
    clearReLoginForm();
    // 清空登录记录
    localStorage.removeItem(StoreEnum.USER);
    // 返回登录页
    router.push(RouterViews.LOGIN.name);
  });
  return false;
};

function onReLoginDialogLoginClick() {
  // 验证表单是否有错误
  formReLoginRef.value
    ?.validate((errors) => {
      if (!errors) {
        isReLoginLoading.value = true;
        // 登录
        login(formReLogin.username, formReLogin.password)
          .then((res) => {
            // 登录成功
            // 将返回的用户信息和 Token 令牌存储
            localStorage.setItem(StoreEnum.USER, JSON.stringify(res.data));
            isReLoginLoading.value = false;
            // 关闭重新登录对话框显示
            visibleReLoginDialog.value = false;
            // 清空重新登录对话框表单
            clearReLoginForm();
            successMsg('登录成功');
          })
          .catch((err) => {
            // 登录失败
            errorMsg(err);
            isReLoginLoading.value = false;
          });
      }
    })
    .catch(() => {});

  return false;
}
</script>

<template>
  <n-config-provider
    class="container"
    :theme-overrides="themeOverrides"
    :theme="currentTheme"
    :locale="zhCN"
    :date-locale="dateZhCN"
  >
    <AppProvider>
      <!-- 重新登录模态框 -->
      <n-modal
        ref="reLoginDialog"
        v-model:show="visibleReLoginDialog"
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
      >
        <template #default>
          <n-form
            ref="formReLoginRef"
            class="dialog-form"
            :model="formReLogin"
            :show-label="false"
          >
            <n-form-item
              path="username"
              :rule="{ required: true, message: '请输入用户名' }"
            >
              <n-input
                v-model:value="formReLogin.username"
                placeholder="用户名"
                @keydown.enter.prevent
              />
            </n-form-item>
            <n-form-item
              path="password"
              :rule="{ required: true, message: '请输入密码' }"
            >
              <n-input
                v-model:value="formReLogin.password"
                placeholder="密码"
                type="password"
                show-password-on="mousedown"
                @keydown.enter.prevent
              />
            </n-form-item>
          </n-form>
        </template>
      </n-modal>

      <n-layout class="main-layout" has-sider>
        <n-layout-sider
          v-if="!hideSider"
          bordered
          show-trigger
          collapse-mode="width"
          :collapsed-width="64"
          :width="240"
          :native-scrollbar="false"
          :on-update-collapsed="onSiderCollapsed"
          :collapsed="isSiderCollapsed"
        >
          <div
            class="sider-logo transition"
            :style="
              !isSiderCollapsed
                ? 'padding: 0 0 0 88px;margin-top: 5px;'
                : 'padding: 0 0 0 12px; height: 48px;margin-top: 12px;'
            "
          >
            <n-image
              :src="NolaIcon"
              preview-disabled
              :width="!isSiderCollapsed ? 64 : 42"
              :height="!isSiderCollapsed ? 64 : 42"
              alt="Nola"
            />
          </div>
          <n-menu
            :collapsed-width="64"
            :collapsed-icon-size="22"
            :options="menuOptions"
            :value="route.name"
            @update-value="onSiderMenuUpdate"
          />
        </n-layout-sider>
        <n-layout>
          <n-layout-header :bordered="!hideSider" class="layout-header">
            <n-row>
              <n-col :span="10">
                <div class="header-title" v-if="!hideSider">
                  <span>{{ route.meta['displayName'] }}</span>
                </div>
              </n-col>
              <n-col :span="14">
                <!-- 右侧操作按钮 -->
                <div class="header-options">
                  <n-space>
                    <div v-if="!hideSider">
                      <n-dropdown
                        trigger="click"
                        :options="avatarOptions"
                        show-arrow
                        @select="onAvatarSelect"
                      >
                        <div>
                          <n-button
                            round
                            class="btn-avatar"
                            strong
                            secondary
                            :style="
                              'padding-right: ' +
                              (isSmallWindow ? '5px;' : '12px;')
                            "
                          >
                            <!-- 用户头像不为空显示头像 -->
                            <n-image
                              v-if="user?.avatar !== null"
                              class="avatar"
                              :src="user?.avatar"
                              width="22"
                              height="22"
                              preview-disabled
                              :style="
                                'margin-right: ' +
                                (isSmallWindow ? '0px;' : '6px;')
                              "
                            />
                            <!-- 用户头像为空，显示名称第一个字 -->
                            <div
                              v-else
                              class="avatar-text"
                              :style="
                                'margin-right: ' +
                                (isSmallWindow ? '0px;' : '6px;')
                              "
                            >
                              {{ user?.displayName[0] }}
                            </div>
                            <span v-if="!isSmallWindow">{{
                              user?.displayName
                            }}</span>
                          </n-button>
                        </div>
                      </n-dropdown>
                    </div>

                    <n-button circle @click="onSwitchTheme" secondary>
                      <template #icon>
                        <n-icon>
                          <SunIcon v-if="currentTheme === undefined" />
                          <MoonIcon v-else />
                        </n-icon>
                      </template>
                    </n-button>
                  </n-space>
                </div>
              </n-col>
            </n-row>
          </n-layout-header>
          <n-layout-content class="layout-content">
            <router-view />
          </n-layout-content>
        </n-layout>
      </n-layout>
    </AppProvider>
  </n-config-provider>
</template>

<style scoped>
.container {
  min-height: 100%;
  height: 100%;
}
.main-layout {
  min-height: 100%;
  height: 100%;
}
.layout-header {
  height: 64px;
}

.header-options {
  height: 64px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: end;
  padding: 0 20px;
}

.header-title {
  height: 64px;
  line-height: 64px;
  padding: 0 20px;
}

.header-title span {
  font-size: 1.2em;
  font-weight: bold;
}

.sider-logo {
  padding: 0;
  height: 64px;
}

.transition :deep(img) {
  transition: all 0.5s ease;
}

.layout-content {
  min-height: calc(100% - 64px);
  padding: 10px;
}

.btn-avatar {
  padding-left: 6px;
}

.btn-avatar .avatar {
  border-radius: 99px;
  padding: 0;
  border: 1px solid rgb(153, 153, 153, 0.1);
}

.btn-avatar .avatar-text {
  width: 22px;
  height: 22px;
  line-height: 22px;
  background-color: var(--color-primary);
  border-radius: 999px;
  color: white;
  font-size: .8em;
}
</style>
