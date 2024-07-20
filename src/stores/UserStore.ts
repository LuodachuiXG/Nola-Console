import { defineStore } from 'pinia';
import { StoreKey } from './StoreKey.ts';
import { User } from '../models/User.ts';
import { computed, ref } from 'vue';
import { SecureLSStorage } from '../security/SecureLS.ts';

/**
 * 用户 Store
 */
export const useUserStore = defineStore(
  StoreKey.USER.toString(),
  () => {
    const user = ref<User | null>(null);

    /** 是否已经登录 **/
    const isLogin = computed(() => !!user.value);

    /** 登录 Token **/
    const token = computed(() => user.value?.token ?? '');

    /**
     * 登录（将用户信息存储）
     * @param user 用户接口
     */
    function login(user: User) {
      this.user = user;
    }

    /**
     * 登出（清除用户信息）
     */
    function logout() {
      this.user = null;
    }

    return {
      user,
      isLogin,
      token,
      login,
      logout
    };
  },
  {
    persist: {
      storage: SecureLSStorage
    }
  }
);
