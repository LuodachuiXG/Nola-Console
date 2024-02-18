<script setup lang="ts">
import {onMounted, ref, watch} from "vue";
import {Message} from "@arco-design/web-vue";
import {
  IconCaretRight,
  IconCaretLeft,
  IconHome,
  IconCalendar,
  IconSun,
  IconMoon
} from "@arco-design/web-vue/es/icon";
import {RouteLocationNormalizedLoaded, useRoute, useRouter} from 'vue-router';
import {RouterViews} from "./router/RouterViews.ts";
import {changeTheme, initTheme} from "./utils/MyUtils.ts";

// 当前主题颜色
const currentTheme = ref("light");

// 当前路由线路
const route = useRoute();
// 路由控制器
const router = useRouter();

// 是否隐藏左侧菜单
const hideSider = ref(true)

onMounted(() => {
  // 初始化主题颜色
  currentTheme.value = initTheme();
  watch(route, (e: RouteLocationNormalizedLoaded) => {
    const hideViews = [RouterViews.LOGIN]
    hideSider.value = hideViews.includes(e.name as RouterViews);
  });
});

// 左边菜单栏是否收缩
const collapsed = ref(false);

/**
 * 左侧菜单栏收缩/展开
 */
const onCollapse = () => {
  collapsed.value = !collapsed.value;
};

const onClickMenuItem = (key: number) => {
  Message.info({content: `You select ${key}`, showIcon: true});
};

const onChangeTheme = () => {
  currentTheme.value = changeTheme();
}
</script>

<template>
  <a-layout class="layout-main">
    <a-layout-sider v-if="!hideSider" hide-trigger collapsible :collapsed="collapsed">
      <a-menu
          :defaultOpenKeys="['1']"
          :defaultSelectedKeys="['0_3']"
          :style="{ width: '100%' }"
          @menuItemClick="onClickMenuItem"
      >
        <div class="logo">
          <a-avatar
              shape="square"
              style="background-color: rgba(255, 255, 255, 0);"
              :size="34"
          >
            <img
                alt="avatar"
                src="./assets/nola.png"
            />
          </a-avatar>
          <span class="menu-title">Nola</span>
        </div>
        <a-menu-item key="0_1" disabled>
          <IconHome/>
          Menu 1
        </a-menu-item>
        <a-menu-item key="0_2">
          <IconCalendar/>
          Menu 2
        </a-menu-item>
        <a-menu-item key="0_3">
          <IconCalendar/>
          Menu 3
        </a-menu-item>
        <a-sub-menu key="1">
          <template #title>
            <span><IconCalendar/>Navigation 1</span>
          </template>
          <a-menu-item key="1_1">Menu 1</a-menu-item>
          <a-menu-item key="1_2">Menu 2</a-menu-item>
          <a-sub-menu key="2" title="Navigation 2">
            <a-menu-item key="2_1">Menu 1</a-menu-item>
            <a-menu-item key="2_2">Menu 2</a-menu-item>
          </a-sub-menu>
          <a-sub-menu key="3" title="Navigation 3">
            <a-menu-item key="3_1">Menu 1</a-menu-item>
            <a-menu-item key="3_2">Menu 2</a-menu-item>
            <a-menu-item key="3_3">Menu 3</a-menu-item>
          </a-sub-menu>
        </a-sub-menu>
        <a-sub-menu key="4">
          <template #title>
            <span><IconCalendar/>Navigation 4</span>
          </template>
          <a-menu-item key="4_1">Menu 1</a-menu-item>
          <a-menu-item key="4_2">Menu 2</a-menu-item>
          <a-menu-item key="4_3">Menu 3</a-menu-item>
        </a-sub-menu>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header>
        <a-row>
          <a-col :span="20">
            <!-- 左侧菜单折叠按钮 -->
            <div class="header-collapse" v-if="!hideSider">
              <a-button shape="round" @click="onCollapse">
                <IconCaretRight v-if="collapsed"/>
                <IconCaretLeft v-else/>
              </a-button>
            </div>
          </a-col>
          <a-col :span="4">
            <!-- 右侧操作按钮 -->
            <div class="header-options">
              <a-space>
                <a-button shape="circle" @click="onChangeTheme">
                  <IconSun v-if="currentTheme === 'light'"/>
                  <IconMoon v-else />
                </a-button>
              </a-space>
            </div>
          </a-col>
        </a-row>


      </a-layout-header>
      <a-layout-content>
        <router-view/>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<style scoped>
.layout-main {
  height: 100%;
}

.layout-main :deep(.arco-layout-sider) .logo {
  height: 32px;
  line-height: 32px;
  margin: 4px;
}

.layout-main :deep(.arco-layout-header) {
  height: 64px;
  line-height: 64px;
  padding: 0 20px;
  background: var(--color-bg-3);
}

.layout-main :deep(.arco-layout-content) {
  color: var(--color-text-2);
  font-weight: 400;
  font-size: 14px;
  background: var(--color-bg-3);
}

.layout-main :deep(.arco-layout-content) {
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-size: 16px;
  font-stretch: condensed;
  text-align: center;
}

.header-options {
  display: flex;
  height: 64px;
  line-height: 64px;
  justify-content: end;
}
</style>
