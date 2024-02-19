import { MessageApiInjection } from 'naive-ui/es/message/src/MessageProvider';
import { NotificationApiInjection } from 'naive-ui/es/notification/src/NotificationProvider';
import { DialogApiInjection } from 'naive-ui/es/dialog/src/DialogProvider';
import { LoadingBarApiInjection } from 'naive-ui/es/loading-bar/src/LoadingBarProvider';

/**
 * 声明全局变量，将这些 API 注入到浏览器的 window 对象上
 */
declare global {
  // 在全局作用域的 Window 接口中扩展属性
  interface Window {
    $message: MessageApiInjection;
    $notification: NotificationApiInjection;
    $dialog: DialogApiInjection;
    $loadingBar: LoadingBarApiInjection;
  }
}
