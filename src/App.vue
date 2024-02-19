<script setup lang="ts">
import { Component, onMounted, ref, watch, h } from 'vue';
import {
  RouteLocationNormalizedLoaded,
  RouterLink,
  useRoute
} from 'vue-router';
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
  LockClosedOutline as LockIcon
} from '@vicons/ionicons5';
import themeOverrides from './theme/theme.ts';
import type { BuiltInGlobalTheme } from 'naive-ui/es/themes/interface';
import { getCurrentTheme, setTheme } from './utils/MyUtils.ts';
import AppProvider from './components/AppProvider/AppProvider.vue';
import { StoreEnum } from './models/enum/StoreEnum.ts';
import NolaIcon from './assets/nola.png';
import { User } from './models/User.ts';
import router from './router';

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

// 菜单选项
const menuOptions = [
  {
    label: () =>
      h(
        RouterLink,
        {
          to: {
            name: RouterViews.MAIN.name
          }
        },
        { default: () => RouterViews.MAIN.menuName }
      ),
    key: RouterViews.MAIN.name,
    icon: renderIcon(BarChartIcon)
  },
  {
    type: 'divider'
  },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: {
            name: RouterViews.POST.name
          }
        },
        { default: () => RouterViews.POST.menuName }
      ),
    key: RouterViews.POST.name,
    icon: renderIcon(BookIcon)
  },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: {
            name: RouterViews.TAG.name
          }
        },
        { default: () => RouterViews.TAG.menuName }
      ),
    key: RouterViews.TAG.name,
    icon: renderIcon(TagIcon)
  },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: {
            name: RouterViews.CATEGORY.name
          }
        },
        { default: () => RouterViews.CATEGORY.menuName }
      ),
    key: RouterViews.CATEGORY.name,
    icon: renderIcon(CategoryIcon)
  },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: {
            name: RouterViews.COMMENT.name
          }
        },
        { default: () => RouterViews.COMMENT.menuName }
      ),
    key: RouterViews.COMMENT.name,
    icon: renderIcon(CommentIcon)
  },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: {
            name: RouterViews.ATTACHMENT.name
          }
        },
        { default: () => RouterViews.ATTACHMENT.menuName }
      ),
    key: RouterViews.ATTACHMENT.name,
    icon: renderIcon(FileIcon)
  },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: {
            name: RouterViews.LINK.name
          }
        },
        { default: () => RouterViews.LINK.menuName }
      ),
    key: RouterViews.LINK.name,
    icon: renderIcon(AtIcon)
  },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: {
            name: RouterViews.MENU.name
          }
        },
        { default: () => RouterViews.MENU.menuName }
      ),
    key: RouterViews.MENU.name,
    icon: renderIcon(MenuIcon)
  },
  {
    type: 'divider'
  },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: {
            name: RouterViews.SETTING.name
          }
        },
        { default: () => RouterViews.SETTING.menuName }
      ),
    key: RouterViews.SETTING.name,
    icon: renderIcon(SettingIcon)
  },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: {
            name: RouterViews.BACKUP.name
          }
        },
        { default: () => RouterViews.BACKUP.menuName }
      ),
    key: RouterViews.BACKUP.name,
    icon: renderIcon(BackUpIcon)
  },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: {
            name: RouterViews.SYSTEM.name
          }
        },
        { default: () => RouterViews.SYSTEM.menuName }
      ),
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
  // 刷新当前登录用户
  let _user = localStorage.getItem(StoreEnum.USER);
  if (_user !== null) {
    user.value = JSON.parse(_user) as User;
  } else {
    user.value = null;
  }
});

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
  isSiderCollapsed.value = collapsed;
  // 将侧边栏折叠记录
  localStorage.setItem(
    StoreEnum.SIDER_COLLAPSED,
    String(isSiderCollapsed.value)
  );
};

/**
 * 处理头像下拉菜单选择事件
 */
const onAvatarSelect = (key: string | number) => {
  switch (key) {
    case 'logout':
      window.$dialog.info({
        title: '注销',
        content: '确定要注销登录吗',
        positiveText: '确定',
        onPositiveClick: () => {
          // 删除登录用户信息
          localStorage.removeItem(StoreEnum.USER);
          // 跳转登录页
          router.push(RouterViews.LOGIN.name);
        }
      });
      break;
  }
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
          />
        </n-layout-sider>
        <n-layout>
          <n-layout-header :bordered="!hideSider">
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
                        <n-button round class="btn-avatar" strong secondary>
                          <n-image
                            class="avatar"
                            :src="user?.avatar"
                            width="22"
                            height="22"
                            preview-disabled
                          />
                          {{ user?.displayName }}
                        </n-button>
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
          <n-layout-content
            content-style="padding: 24px;"
            content-class="content"
          >
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
.n-layout-header {
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

.n-layout-content {
  min-height: calc(100% - 64px);
}

.btn-avatar {
  padding-left: 6px;
  padding-right: 12px;
}

.btn-avatar .avatar {
  border-radius: 99px;
  padding: 0;
  margin-right: 10px;
  border: 1px solid rgb(153, 153, 153, 0.1);
}
</style>
