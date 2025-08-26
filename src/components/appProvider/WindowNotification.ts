import { defineComponent } from 'vue';
import { useNotification } from 'naive-ui';

/**
 * 封装 Notification
 */
export default defineComponent({
  setup() {
    window.$notification = useNotification();
    return () => null;
  }
});
