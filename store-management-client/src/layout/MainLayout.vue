<template>
  <el-container class="main-layout">
    <el-header class="header">
      <div class="logo-title">川岳員工及會員管理系統</div>
      <div class="user-menu">
        <el-dropdown v-if="authStore.user">
          <span class="el-dropdown-link">
            <el-avatar :icon="UserFilled" size="small" />
            <span class="username">{{ authStore.user.email }}</span>
            <el-icon class="el-icon--right"><arrow-down /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>個人資料</el-dropdown-item>
              <el-dropdown-item divided @click="handleLogout">登出</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>
    <el-container>
      <el-aside width="200px" class="aside">
        <el-menu
          :default-active="activeMenu"
          class="nav-menu"
          router
        >
          <el-menu-item index="/dashboard">
            <el-icon><House /></el-icon>
            <span>主控台</span>
          </el-menu-item>
          <el-menu-item index="/members">
            <el-icon><User /></el-icon>
            <span>會員管理</span>
          </el-menu-item>
          <el-menu-item index="/employees">
            <el-icon><Briefcase /></el-icon>
            <span>員工管理</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../store/auth';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  ArrowDown,
  UserFilled,
  House,
  User,
  Briefcase,
} from '@element-plus/icons-vue';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const activeMenu = computed(() => {
  // To handle nested routes, we can check the start of the path
  if (route.path.startsWith('/members')) return '/members';
  if (route.path.startsWith('/employees')) return '/employees';
  return route.path;
});

const handleLogout = () => {
  ElMessageBox.confirm('您確定要登出嗎？', '提示', {
    confirmButtonText: '確定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    authStore.logout();
    ElMessage.success('登出成功');
    router.push('/login');
  }).catch(() => {
    // Cancelled
  });
};
</script>

<style scoped>
.main-layout, .el-container {
  height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  border-bottom: 1px solid #dcdfe6;
  padding: 0 20px;
}

.logo-title {
  font-size: 1.2em;
  font-weight: bold;
  color: #303133;
}

.user-menu .el-dropdown-link {
  cursor: pointer;
  display: flex;
  align-items: center;
}

.username {
  margin-left: 8px;
  margin-right: 8px;
}

.aside {
  background-color: #fff;
  border-right: 1px solid #dcdfe6;
}

.nav-menu {
  border-right: none;
}

.main-content {
  padding: 20px;
  background-color: #f0f2f5;
}
</style>
