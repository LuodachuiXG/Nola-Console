<script setup lang="ts">
import { onMounted, ref, watch, onUnmounted } from 'vue';
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
  darkTheme,
  zhCN,
  dateZhCN
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
import { getCurrentTheme, renderIcon, setTheme } from './utils/MyUtils.ts';
import AppProvider from './components/appProvider/AppProvider.vue';
import { StoreKey } from './stores/StoreKey.ts';
import NolaIcon from './assets/nola.png';
import router from './router';
import { confirmDialog } from './utils/Message.ts';
import bus from './utils/EventBus.ts';
import { BusEnum } from './models/enum/BusEnum.ts';
import MyAdminInfoModal from './components/component/MyAdminInfoModal.vue';
import MyAdminUpdatePasswordModal from './components/component/MyAdminUpdatePasswordModal.vue';
import { getRealUrl } from './utils/NetworkUtil.ts';
import { useUserStore } from './stores/UserStore.ts';
import { useGlobalStore } from './stores/GlobalStore.ts';
import ReloginModal from './components/component/ReloginModal.vue'

// 全局响应式变量
const globalStore = useGlobalStore();

// 鼠标是否进入 LOGO
const isLogoEnter = ref(false);
// 鼠标是否点击 LOGO
const isLogoClick = ref(false);

// 用户 Store
const userStore = useUserStore();

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

// 是否显示重新登录对话框，用于登录过期时快捷重新登录
const visibleReLoginDialog = ref(false);

// 是否显示管理员信息模态框
const visibleUserInfoDialog = ref(false);

// 是否显示修改密码模态框
const visibleUpdatePasswordDialog = ref(false);

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
    localStorage.getItem(StoreKey.SIDER_COLLAPSED.toString()) === 'true';

  // 监听路由变化
  watch(route, (e: RouteLocationNormalizedLoaded) => {
    // 如果当前是登录页面，就隐藏侧边菜单
    hideSider.value = e.name === RouterViews.LOGIN.name;
  });

  // 添加窗口大小改变事件监听器，动态修改侧边栏是否展开
  window.addEventListener('resize', handlerWindowResize);
  handlerWindowResize();

  // 监听事件总线中登录过期消息
  bus.on(BusEnum.LOGIN_EXPIRED, () => {
    // 收到登录过期消息，显示重新登录对话框
    visibleReLoginDialog.value = true;
  });

  // 监听暗色主题消息
  bus.on(BusEnum.THEME_DARK, () => {
    onSwitchTheme(true);
  });

  // 监听亮色主题消息
  bus.on(BusEnum.THEME_LIGHT, () => {
    onSwitchTheme();
  });

  // 监听隐藏侧边栏消息
  bus.on(BusEnum.HIDDEN_SIDER, () => {
    hideSider.value = true;
  });

  // 监听显示侧边栏消息
  bus.on(BusEnum.VISIBLE_SIDER, () => {
    hideSider.value = false;
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
  if (!isManualUpdateSider.value) {
    // 如果用户之前没有手动修改过侧边栏
    // 这里就根据窗口大小自动改变侧边栏状态
    isSiderCollapsed.value = globalStore.isSmallWindow as boolean;
  }
};

/**
 * 主题切换事件
 */
const onSwitchTheme = (isDarkTheme: boolean | null = null) => {
  if (isDarkTheme !== null) {
    currentTheme.value = isDarkTheme ? darkTheme : undefined;
    setTheme(isDarkTheme ? 'dark' : 'light');
    return;
  }

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
    StoreKey.SIDER_COLLAPSED.toString(),
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
    case 'admin_info':
      // 弹出管理员信息模态框
      visibleUserInfoDialog.value = true;
      break;
    case 'update_password':
      // 弹出修改密码模态框
      visibleUpdatePasswordDialog.value = true;
      break;
    case 'logout':
      // 弹出确认对话框
      confirmDialog('确定要注销登录吗？', () => {
        // 删除登录用户信息
        userStore.logout();
        // 跳转登录页
        router.push(RouterViews.LOGIN.name);
      });
      break;
  }
};

/**
 * 鼠标进入 LOGO 图标事件
 */
const onMouseEnterLogo = () => {
  if (isLogoClick.value || isLogoEnter.value) return;
  isLogoEnter.value = true;
  setTimeout(() => {
    isLogoEnter.value = false;
  }, 500);
};

/**
 * 鼠标点击 LOGO 图标事件
 */
const onMouseClickLogo = () => {
  if (isLogoClick.value || isLogoEnter.value) return;
  isLogoClick.value = true;
  setTimeout(() => {
    isLogoClick.value = false;
  }, 1500);
};
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
      <!-- 管理员信息模态框 -->
      <my-admin-info-modal v-model:show="visibleUserInfoDialog" />

      <!-- 修改密码模态框 -->
      <my-admin-update-password-modal
        v-model:show="visibleUpdatePasswordDialog"
      />

      <!-- 重新登录模态框 -->
      <relogin-modal v-model:show="visibleReLoginDialog" />

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
              class="animate__animated blog-logo"
              :class="{
                animate__flip: isLogoEnter,
                animate__hinge: isLogoClick
              }"
              :src="NolaIcon"
              preview-disabled
              :width="!isSiderCollapsed ? 64 : 42"
              :height="!isSiderCollapsed ? 64 : 42"
              alt="Nola"
              @mouseenter="onMouseEnterLogo"
              @click="onMouseClickLogo"
            />
          </div>
          <n-menu
            :collapsed-width="64"
            :collapsed-icon-size="22"
            :options="menuOptions"
            :value="route.name?.toString()"
            @update-value="onSiderMenuUpdate"
          />
        </n-layout-sider>
        <n-layout>
          <n-layout-header
            :bordered="!hideSider"
            class="layout-header"
            v-if="route.name !== RouterViews.EDITOR.name"
          >
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
                              (globalStore.isSmallWindow ? '5px;' : '12px;')
                            "
                          >
                            <!-- 用户头像不为空显示头像 -->
                            <n-image
                              v-if="userStore.getUser?.avatar"
                              class="avatar"
                              :src="getRealUrl(userStore.getUser?.avatar)"
                              width="22"
                              height="22"
                              preview-disabled
                              :style="
                                'margin-right: ' +
                                (globalStore.isSmallWindow ? '0px;' : '6px;')
                              "
                              object-fit="cover"
                            />
                            <!-- 用户头像为空，显示名称第一个字 -->
                            <div
                              v-else
                              class="avatar-text"
                              :style="
                                'margin-right: ' +
                                (globalStore.isSmallWindow ? '0px;' : '6px;')
                              "
                            >
                              {{ userStore.getUser?.displayName[0] }}
                            </div>
                            <span v-if="!globalStore.isSmallWindow">{{
                              userStore.getUser?.displayName
                            }}</span>
                          </n-button>
                        </div>
                      </n-dropdown>
                    </div>

                    <n-button circle @click="onSwitchTheme()" secondary>
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
          <n-layout-content class="layout-content" embedded>
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
  font-size: 0.8em;
}

.blog-logo {
  cursor: pointer;
}
</style>
