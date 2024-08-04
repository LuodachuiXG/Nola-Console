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
    const _user = ref<User | null>(null);

    const getUser = computed(() => _user.value);

    /** 是否已经登录 **/
    const isLogin = computed(() => _user.value != null);

    /** 登录 Token **/
    const token = computed(() => _user.value?.token ?? '');

    /**
     * 登录（将用户信息存储）
     * @param user 用户接口
     */
    function login(user: User) {
      _user.value = user;
    }

    /**
     * 登出（清除用户信息）
     */
    function logout() {
      _user.value = null;
    }

    return {
      _user,
      getUser,
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
