<!-- 备份卡片组件 -->
<script setup lang="ts">
import { NCard, NIcon, NText } from 'naive-ui';
import { ref } from 'vue';

interface Props {
  title: string;
  content: string;
  tips?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'onClick'): void;
}>();

const isHover = ref(false);

/**
 * 卡片 hover 事件
 * @param hover
 */
const onCardHover = (hover: boolean) => {
  if (props.tips) {
    isHover.value = hover;
  }
}
</script>

<template>
  <div class="card-div">
    <n-card
      size="small"
      @click="emit('onClick')"
      @mouseenter="onCardHover(true)"
      @mouseleave="onCardHover(false)"
    >
      <template #header>
        <n-text class="card-title">{{ title }}</n-text>
      </template>
      <template #default>
        <div class="card-content">
          <div
            v-if="!isHover"
            class="animate__animated animate__flipInX"
          >
            <n-icon class="card-icon" size="32">
              <slot name="icon"></slot>
            </n-icon>
            <n-text class="card-tips">{{ content }}</n-text>
          </div>
          <div v-else class="animate__animated animate__flipInX">
            <n-text>{{ tips }}</n-text>
          </div>
        </div>
      </template>
    </n-card>
  </div>
</template>

<style scoped>
.card-div {
  display: inline-block;
  width: 180px;
  cursor: pointer;
  user-select: none;

  .card-title {
    text-align: center;
    display: block;
  }

  .card-content {
    text-align: center;
    height: 82px;
    max-height: 82px;

    .card-icon {
      margin-top: 10px;
    }

    .card-tips {
      display: block;
      margin-top: 10px;
    }
  }
}
</style>
