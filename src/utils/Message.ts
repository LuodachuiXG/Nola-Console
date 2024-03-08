/**
 * 封装确认对话框
 * @param msg 对话框消息
 * @param onPositiveClick 确定事件
 * @param onNegativeClick 取消事件
 */
export function confirmDialog(
  msg: string,
  onPositiveClick: () => void,
  onNegativeClick?: () => void
) {
  window.$dialog.info({
    title: '温馨提示',
    content: msg,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick() {
      onPositiveClick();
    },
    onNegativeClick() {
      onNegativeClick?.()
    }
  });
}

/**
 * 封装操作成功消息
 */
export function optionSuccessMsg() {
  successMsg('操作成功');
}

/**
 * 封装操作失败消息
 */
export function optionErrorMsg() {
  errorMsg('操作失败');
}

/**
 * 封装成功消息
 * @param msg 消息内容
 */
export function successMsg(msg: string) {
  window.$message.success(msg);
}

/**
 * 封装错误消息
 * @param msg 消息内容
 */
export function errorMsg(msg: string) {
  window.$message.error(msg);
}
