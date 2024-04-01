<!-- 附件组件 -->
<script setup lang="ts">
import {
  NSpace,
  NSelect,
  SelectOption,
  NInputGroup,
  NIcon,
  NButton
} from 'naive-ui';
import { ref } from 'vue';
import { MenuOutline as MenuIcon } from '@vicons/ionicons5';

// 存储策略下拉框选项
const storageModeSelectOptions = ref<Array<SelectOption>>([]);

// 文件分组下拉框选项
const fileGroupSelectOptions = ref<Array<SelectOption>>([]);
</script>

<template>
  <div class="container">
    <!-- 工具栏 -->
    <div class="toolbar">
      <n-space>

        <n-input-group>
          <n-select
            style="width: 150px"
            :options="storageModeSelectOptions"
            placeholder="全部存储策略"
            clearable
          />
          <n-button>
            <template #icon>
              <n-icon>
                <MenuIcon />
              </n-icon>
            </template>
          </n-button>
        </n-input-group>

        <n-input-group>
          <n-select
            style="width: 150px"
            :options="fileGroupSelectOptions"
            placeholder="全部分组"
            clearable
          />
          <n-button>
            <template #icon>
              <n-icon>
                <MenuIcon />
              </n-icon>
            </template>
          </n-button>
        </n-input-group>
      </n-space>
    </div>
  </div>
</template>

<style scoped>
.container {
  padding: 10px;
}
</style>
