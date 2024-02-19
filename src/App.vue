<script setup lang="ts">
import { Component, onMounted, ref, watch, h } from 'vue';
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
  darkTheme,
  zhCN,
  dateZhCN
} from 'naive-ui';
import {
  BookOutline as BookIcon,
  PersonOutline as PersonIcon,
  WineOutline as WineIcon,
  SunnyOutline as SunIcon,
  MoonOutline as MoonIcon
} from '@vicons/ionicons5';
import themeOverrides from './theme/theme.ts';
import type { BuiltInGlobalTheme } from 'naive-ui/es/themes/interface';
import { getCurrentTheme, setTheme } from './utils/MyUtils.ts';
import AppProvider from './components/AppProvider/AppProvider.vue';

// 当前主题颜色
const currentTheme = ref<BuiltInGlobalTheme | undefined>();

// 当前路由线路
const route = useRoute();

// 是否隐藏左侧菜单
const hideSider = ref(true);

function renderIcon(icon: Component) {
  return () => h(NIcon, null, { default: () => h(icon) });
}

const menuOptions = [
  {
    label: '且听风吟',
    key: 'hear-the-wind-sing',
    icon: renderIcon(BookIcon)
  },
  {
    label: '1973年的弹珠玩具',
    key: 'pinball-1973',
    icon: renderIcon(BookIcon),
    disabled: true,
    children: [
      {
        label: '鼠',
        key: 'rat'
      }
    ]
  },
  {
    label: '寻羊冒险记',
    key: 'a-wild-sheep-chase',
    disabled: true,
    icon: renderIcon(BookIcon)
  },
  {
    label: '舞，舞，舞',
    key: 'dance-dance-dance',
    icon: renderIcon(BookIcon),
    children: [
      {
        type: 'group',
        label: '人物',
        key: 'people',
        children: [
          {
            label: '叙事者',
            key: 'narrator',
            icon: renderIcon(PersonIcon)
          },
          {
            label: '羊男',
            key: 'sheep-man',
            icon: renderIcon(PersonIcon)
          }
        ]
      },
      {
        label: '饮品',
        key: 'beverage',
        icon: renderIcon(WineIcon),
        children: [
          {
            label: '威士忌',
            key: 'whisky'
          }
        ]
      },
      {
        label: '食物',
        key: 'food',
        children: [
          {
            label: '三明治',
            key: 'sandwich'
          }
        ]
      },
      {
        label: '过去增多，未来减少',
        key: 'the-past-increases-the-future-recedes'
      }
    ]
  }
];

onMounted(() => {
  // 获取之前设置的主题颜色
  currentTheme.value = getCurrentTheme() === 'dark' ? darkTheme : undefined;

  // 监听路由变化
  watch(route, (e: RouteLocationNormalizedLoaded) => {
    const hideViews = [RouterViews.LOGIN];
    // 当前路由在无需显示左侧菜单的页面
    hideSider.value = hideViews.includes(e.name as RouterViews);
  });
});

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
        >
          <n-menu
            :collapsed-width="64"
            :collapsed-icon-size="22"
            :options="menuOptions"
          />
        </n-layout-sider>
        <n-layout>
          <n-layout-header :bordered="!hideSider">
            <n-row>
              <n-col :span="20">
                <div v-if="hideSider"></div>
              </n-col>
              <n-col :span="4">
                <!-- 右侧操作按钮 -->
                <div class="header-options">
                  <n-button circle @click="onSwitchTheme" secondary>
                    <template #icon>
                      <n-icon>
                        <SunIcon v-if="currentTheme === undefined" />
                        <MoonIcon v-else />
                      </n-icon>
                    </template>
                  </n-button>
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

.n-layout-content {
  min-height: calc(100% - 64px);
}
</style>
