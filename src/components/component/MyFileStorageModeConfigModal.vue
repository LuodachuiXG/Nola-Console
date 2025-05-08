<!-- 文件存储策略配置模态框 -->
<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
import {
  NScrollbar,
  NModal,
  NSelect,
  SelectOption,
  NSwitch,
  NForm,
  NFormItem,
  NInput,
  FormInst,
  NText,
  NSpace,
  NButton
} from 'naive-ui';
import {
  FileStorageDisplayName,
  FileStorageMode
} from '../../models/enum/FileStorageMode.ts';
import { TencentCOSConfig } from '../../models/TencentCOSConfig.ts';
import { getTencentCOS, setTencentCOS } from '../../apis/fileApi.ts';
import { successMsg } from '../../utils/Message.ts';

// 是否显示模态框
const show = defineModel('show', {
  type: Boolean,
  default: false
});

const emit = defineEmits<{
  (e: 'onSaveFinish'): void;
}>();

// 腾讯云对象存储配置表单引用
const formTencentCOSRef = ref<FormInst | null>(null);

// 存储策略选择框选项
const storageModeSelectOptions = ref<Array<SelectOption>>([]);
// 存储策略选择框值
const storageModeSelectValue = ref<FileStorageMode | null>(null);

// 腾讯云对象存储配置信息表单
const formTencentCOS: TencentCOSConfig = reactive({
  secretId: '',
  secretKey: '',
  region: '',
  bucket: '',
  https: true,
  path: null
});

// 是否正在加载中
const isLoading = ref(false);

onMounted(() => {
  watch(
    () => show.value,
    () => {
      if (show.value) {
        // 清空表单
        clearFormTencentCOSConfig();
        // 清空存储策略选择
        storageModeSelectValue.value = null;
      }
    },
    { immediate: true }
  );

  // 初始化存储策略选择框选项
  storageModeSelectOptions.value = [];
  const storageModes = Object.values(FileStorageMode);
  for (let i = 0; i < storageModes.length; i++) {
    const sm = storageModes[i];
    if (sm === FileStorageMode.LOCAL) {
      // 跳过本次存储
      continue;
    }
    storageModeSelectOptions.value.push({
      label: FileStorageDisplayName[sm],
      value: sm
    });
  }
});

/**
 * 刷新腾讯云对象存储配置
 */
const refreshTencentCOSConfig = () => {
  isLoading.value = true;
  getTencentCOS()
    .then((res) => {
      if (res.data) {
        // 已经设置了腾讯云对象存储
        // 将配置信息填入表单
        const tencentCOSConfig = res.data as TencentCOSConfig;
        formTencentCOS.secretId = tencentCOSConfig.secretId;
        formTencentCOS.secretKey = tencentCOSConfig.secretKey;
        formTencentCOS.bucket = tencentCOSConfig.bucket;
        formTencentCOS.region = tencentCOSConfig.region;
        formTencentCOS.path = tencentCOSConfig.path;
        formTencentCOS.https = tencentCOSConfig.https;
      }
      isLoading.value = false;
    })
    .catch(() => {
      isLoading.value = false;
    });
};

/**
 * 清空腾讯云对象存储表单
 */
const clearFormTencentCOSConfig = () => {
  formTencentCOS.secretId = '';
  formTencentCOS.secretKey = '';
  formTencentCOS.region = '';
  formTencentCOS.bucket = '';
  formTencentCOS.https = true;
  formTencentCOS.path = null;
};

/**
 * 存储策略选择框值改变
 * @param value
 */
const onStorageModeSelectChange = (value: FileStorageMode | null) => {
  switch (value) {
    case FileStorageMode.TENCENT_COS:
      // 腾讯云对象存储
      refreshTencentCOSConfig();
      break;
  }
};

/**
 * 文件存储策略模态框保存事件
 */
const onSaveClick = () => {
  switch (storageModeSelectValue.value) {
    case FileStorageMode.TENCENT_COS:
      // 保存腾讯云对象存储配置
      formTencentCOSRef.value
        ?.validate((errors) => {
          if (!errors) {
            const config: TencentCOSConfig = {
              secretId: formTencentCOS.secretId,
              secretKey: formTencentCOS.secretKey,
              region: formTencentCOS.region,
              bucket: formTencentCOS.bucket,
              https: formTencentCOS.https,
              path: formTencentCOS.path
            };
            setTencentCOS(config)
              .then(() => {
                successMsg('配置保存成功');
                emit('onSaveFinish');
                show.value = false;
              })
              .catch(() => {});
          }
        })
        .catch(() => {});
      break;
  }
  return false;
};
</script>

<template>
  <!-- 配置文件存储策略模态框 -->
  <n-modal
    v-model:show="show"
    preset="dialog"
    title="配置存储策略"
    positive-text="保存"
    negative-text="关闭"
    :loading="isLoading"
    @negativeClick="show = false"
    @positive-click="onSaveClick"
  >
    <template #default>
      <n-scrollbar style="max-height: 70vh; padding-right: 12px">
        <div style="margin: 10px 5px">
          <n-select
            placeholder="选择存储策略"
            :options="storageModeSelectOptions"
            @update:value="onStorageModeSelectChange"
            v-model:value="storageModeSelectValue"
            clearable
          />

          <div v-if="storageModeSelectValue === FileStorageMode.TENCENT_COS">
            <n-form
              ref="formTencentCOSRef"
              class="dialog-form"
              :model="formTencentCOS"
              :disabled="isLoading"
            >
              <n-form-item
                path="secretId"
                label="Secret ID"
                :rule="{ required: true, message: '请输入 Secret ID' }"
              >
                <n-input
                  placeholder="密钥 ID"
                  v-model:value="formTencentCOS.secretId"
                  clearable
                />
              </n-form-item>

              <n-form-item
                path="secretKey"
                label="Secret Key"
                :rule="{ required: true, message: '请输入 Secret Key' }"
              >
                <n-input
                  placeholder="密钥 Key"
                  v-model:value="formTencentCOS.secretKey"
                  clearable
                />
              </n-form-item>

              <n-form-item
                path="region"
                label="存储区域"
                :rule="{ required: true, message: '请输入存储区域' }"
              >
                <n-space vertical style="width: 100%">
                  <n-input
                    placeholder="存储区域"
                    v-model:value="formTencentCOS.region"
                    clearable
                  />
                  <n-text depth="3">
                    详见
                    <n-button
                      text
                      tag="a"
                      href="https://cloud.tencent.com/document/product/436/6224"
                      target="_blank"
                      type="primary"
                      >地域和访问域名</n-button
                    >
                  </n-text>
                </n-space>
              </n-form-item>

              <n-form-item
                path="bucket"
                label="存储桶名"
                :rule="{ required: true, message: '请输入存储桶名' }"
              >
                <n-input
                  placeholder="存储桶名"
                  v-model:value="formTencentCOS.bucket"
                  clearable
                />
              </n-form-item>

              <n-form-item path="path" label="存储路径">
                <n-input
                  placeholder="文件保存的路径，留空默认存储在存储桶的根目录"
                  v-model:value="formTencentCOS.path"
                  clearable
                />
              </n-form-item>

              <n-form-item path="https" label="使用 HTTPS">
                <n-switch v-model:value="formTencentCOS.https" />
              </n-form-item>
            </n-form>
          </div>
        </div>
      </n-scrollbar>
    </template>
  </n-modal>
</template>

<style scoped></style>
