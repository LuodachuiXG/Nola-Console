import { MessageApiInjection } from 'naive-ui/es/message/src/MessageProvider';
import { NotificationApiInjection } from 'naive-ui/es/notification/src/NotificationProvider';
import { DialogApiInjection } from 'naive-ui/es/dialog/src/DialogProvider';
import { LoadingBarApiInjection } from 'naive-ui/es/loading-bar/src/LoadingBarProvider';

/**
 * 声明全局变量
 */
declare global {
  // 在全局作用域的 Window 接口中扩展属性
  interface Window {
    $message: MessageApiInjection;
    $notification: NotificationApiInjection;
    $dialog: DialogApiInjection;
    $loadingBar: LoadingBarApiInjection;
    $isLarge: boolean;
  }

  interface GlobalVars {
    /** 当前是否是小窗口 （宽度小于 768px） **/
    isSmallWindow: boolean
  }
}
