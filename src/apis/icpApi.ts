import service from './index.ts';

/**
 * 获取备案信息
 */
export function getICP() {
  return service({
    url: '/admin/config/icp',
    method: 'GET'
  });
}

/**
 * 修改备案信息
 * @param icp ICP 备案号
 * @param police 公安备案号
 */
export function updateICP(icp: string | null, police: string | null) {
  return service({
    url: '/admin/config/icp',
    method: 'PUT',
    data: {
      icp: icp,
      police: police
    }
  });
}
