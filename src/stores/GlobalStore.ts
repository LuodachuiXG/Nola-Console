import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { isCurrentSmallWindow } from '../utils/MyUtils.ts';

export const useGlobalStore = defineStore('global', () => {
  const smallWindow = ref<Boolean>(isCurrentSmallWindow());

  /** 当前窗口是否是小窗 **/
  const isSmallWindow = computed(() => {
    return smallWindow.value;
  });

  /**
   * 设置当前窗口是否是小窗
   * @param value
   */
  function setIsSmallWindow(value: Boolean) {
    smallWindow.value = value;
  }

  return {
    smallWindow,
    isSmallWindow,
    setIsSmallWindow
  };
});
