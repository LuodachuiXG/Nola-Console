import { defineComponent } from 'vue';
import { useMessage } from 'naive-ui';

/**
 * 封装 Message
 */
export default defineComponent({
  setup() {
    window.$message = useMessage();
    return () => null;
  }
});
