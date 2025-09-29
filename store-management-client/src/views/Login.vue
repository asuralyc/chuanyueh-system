<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <h2 class="login-title">系統登入</h2>
        </div>
      </template>
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        label-position="top"
        size="large"
        @keyup.enter="handleLogin"
      >
        <el-form-item label="電子郵件" prop="email">
          <el-input
            v-model="loginForm.email"
            placeholder="請輸入電子郵件"
            :prefix-icon="User"
          />
        </el-form-item>
        <el-form-item label="密碼" prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="請輸入密碼"
            show-password
            :prefix-icon="Lock"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            class="login-button"
            :loading="authStore.loading"
            @click="handleLogin"
          >
            登入
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { User, Lock } from '@element-plus/icons-vue';
import { useAuthStore } from '../store/auth';

const router = useRouter();
const authStore = useAuthStore();

const loginFormRef = ref<FormInstance>();

const loginForm = reactive({
  email: 'manager@example.com', // Default value for easy testing
  password: 'password123',      // Default value for easy testing
});

const loginRules = reactive<FormRules>({
  email: [
    { required: true, message: '請輸入電子郵件', trigger: 'blur' },
    { type: 'email', message: '請輸入有效的電子郵件格式', trigger: ['blur', 'change'] },
  ],
  password: [{ required: true, message: '請輸入密碼', trigger: 'blur' }],
});

const handleLogin = async () => {
  if (!loginFormRef.value) return;

  try {
    const valid = await loginFormRef.value.validate();
    if (valid) {
      const success = await authStore.login(loginForm);
      if (success) {
        ElMessage.success('登入成功，歡迎回來！');
        router.push('/'); // Redirect to dashboard
      } else {
        ElMessage.error(authStore.error || '登入失敗');
      }
    }
  } catch (error) {
    console.log('Form validation failed');
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  background-color: #f0f2f5;
}

.login-card {
  width: 100%;
  max-width: 400px;
  border-radius: 8px;
}

.card-header {
  text-align: center;
}

.login-title {
  margin: 0;
  font-size: 1.5em;
  color: #333;
}

.login-button {
  width: 100%;
}
</style>
