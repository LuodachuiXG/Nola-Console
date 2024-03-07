<script setup lang="ts">
import { NTag } from 'naive-ui';
import { ref } from 'vue';
import { Tag } from '../../models/Tag.ts';

// 鼠标是否进入标签
const isMouseEnter = ref(false);

interface Props {
  /** 标签类 */
  tag: Tag;
  /** 标签大小 */
  size: 'small' | 'medium' | 'large' | 'tiny';
  /** 是否显示小手 */
  pointer?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'onMouseEnterTag', tag: Tag): void;
  (e: 'onMouseLeaveTag', tag: Tag): void;
}>();

/**
 * 鼠标进入标签事件
 */
const mouseEnter = () => {
  isMouseEnter.value = true;
  emit('onMouseEnterTag', props.tag);
};

/**
 * 鼠标离开标签事件
 */
const mouseLeave = () => {
  isMouseEnter.value = false;
  emit('onMouseLeaveTag', props.tag);
};
</script>

<template>
  <div @mouseenter="mouseEnter" @mouseleave="mouseLeave">
    <n-tag
      class="transition"
      :style="pointer ? 'cursor: pointer;' : ''"
      :size="size"
      :color="
        tag.color !== null && tag.color !== '' && !isMouseEnter
          ? { textColor: tag.color, borderColor: tag.color }
          : {}
      "
    >
      <span
        :class="
          tag.color !== null && tag.color !== '' && !isMouseEnter
            ? 'tag-text-shadow'
            : ''
        "
      >
        {{ tag.displayName }}</span
      >
    </n-tag>
  </div>
</template>

<style scoped>
</style>
