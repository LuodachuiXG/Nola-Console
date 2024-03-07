<!-- 自定义数字动画组件（解决原组件数字动画不连续的问题）-->
<script setup lang="ts">
import { NNumberAnimation } from 'naive-ui';
import { ref } from 'vue';

const form = ref(0)

/**
 * 组件参数
 */
interface Props {
  /** 目标值 **/
  to: number;
}

const props = defineProps<Props>();

/**
 * 数值动画结束事件
 */
const onFinish = () => {
  form.value = props.to;
}
</script>

<template>
  <n-number-animation :from="form" :to="to" v-on:finish="onFinish" :duration="500"/>
</template>

<style scoped></style>
