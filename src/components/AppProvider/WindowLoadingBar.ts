import { defineComponent } from 'vue';
import { useLoadingBar } from 'naive-ui';

/**
 * 封装 LoadingBar
 */
export default defineComponent({
  setup() {
    window.$loadingBar = useLoadingBar();
    return () => null;
  }
});
