<!-- 备案设置组件 -->
<script setup lang="ts">
import { NButton, NForm, NFormItem, NInput, NScrollbar } from 'naive-ui';
import { onMounted, reactive, ref } from 'vue';
import { getICP, updateICP } from '../../apis/icpApi.ts';
import { successMsg } from '../../utils/Message.ts';
import { ICP } from '../../models/ICP.ts';
import { useGlobalStore } from '../../stores/GlobalStore.ts';

const globalStore = useGlobalStore();

const isLoading = ref(false);

const formICP = reactive({
  // 工业和信息化部网站备案号
  icp: '',
  // 公网安备号
  public: ''
});

onMounted(() => {
  initICP();
});

/**
 * 初始化备案信息
 */
const initICP = () => {
  getICP()
    .then((res) => {
      let icp: ICP | null = res.data;
      formICP.icp = icp?.icp ?? '';
      formICP.public = icp?.public ?? '';
    })
    .catch(() => {});
};

/**
 * 保存按钮点击事件
 */
const onSubmit = () => {
  isLoading.value = true;
  updateICP(formICP.icp, formICP.public)
    .then(() => {
      successMsg('保存成功');
      isLoading.value = false;
    })
    .catch(() => {
      isLoading.value = false;
    });
};
</script>

<template>
  <n-scrollbar style="max-height: calc(100vh - 245px)">
    <n-form
      class="form"
      :model="formICP"
      :style="{ width: globalStore.isSmallWindow ? '95%' : '40vw' }"
    >
      <n-form-item label="ICP 备案号" path="icp">
        <n-input
          v-model:value="formICP.icp"
          clearable
          placeholder="苏ICP备XXXXXXXXXX号"
        />
      </n-form-item>
      <n-form-item label="公网安备号" path="public">
        <n-input
          v-model:value="formICP.public"
          clearable
          placeholder="苏公网安备XXXXXXXXXXXXXX号"
        />
      </n-form-item>
    </n-form>
  </n-scrollbar>
  <div class="btn-div">
    <n-button type="primary" @click="onSubmit" :loading="isLoading">
      保存
    </n-button>
  </div>
</template>

<style scoped>
.form {
  margin-top: 10px;
  padding: 5px;
}

.btn-div {
  margin-top: 10px;
  padding: 0 0 5px 5px;
}
</style>
