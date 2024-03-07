import { defineComponent } from 'vue';
import { useDialog } from 'naive-ui';

/**
 * 封装 Dialog
 */
export default defineComponent({
  setup() {
    window.$dialog = useDialog();
    return () => null;
  }
});
