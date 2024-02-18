<script setup lang="ts">
import {reactive} from "vue";

const form = reactive({
  username: "",
  password: ""
})

</script>

<template>
  <div class="container">
    <a-card class="login-card" :bordered="false">
      <img class="logo" src="../assets/nola.png" alt="Nola"/><br/>
      <a-form class="form" :model="form" size="large" layout="vertical">
        <a-form-item class="form-item" field="username">
          <a-input v-model="form.username" placeholder="用户名"/>
        </a-form-item>
        <a-form-item class="form-item" field="password">
          <a-input-password v-model="form.password" placeholder="密码"/>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" style="width: 100%;">登录</a-button>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  height: 100%;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  margin-top: 5vh;
}

.login-card {
  padding: 40px 20px;

}

.form-item {
  margin-bottom: 10px;
}

.logo {
  width: 90px;
  height: 90px;
  margin-bottom: 20px;
}

.form {
  width: 300px;
}
</style>