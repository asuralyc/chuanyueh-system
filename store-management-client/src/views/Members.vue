<template>
  <div class="members-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>會員管理</span>
        </div>
      </template>

      <!-- Toolbar -->
      <div class="toolbar">
        <el-form :inline="true" :model="searchParams">
          <el-form-item label="搜尋會員">
            <el-input v-model="searchParams.query" placeholder="輸入姓名、手機或 Email"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :icon="Search" @click="handleSearch">搜尋</el-button>
          </el-form-item>
        </el-form>
        <el-button type="success" :icon="Plus" @click="handleAddMember">新增會員</el-button>
      </div>

      <!-- Members Table -->
      <el-table :data="members" v-loading="loading" style="width: 100%">
        <el-table-column prop="memberNumber" label="會員編號" width="120" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="phone" label="手機" width="150" />
        <el-table-column prop="email" label="Email" />
        <el-table-column label="註冊分店" width="150">
          <template #default="scope">
            {{ scope.row.homeBranch.name }}
          </template>
        </el-table-column>
        <el-table-column label="註冊日期" width="180">
          <template #default="scope">
            {{ new Date(scope.row.createdAt).toLocaleDateString() }}
          </template>
        </el-table-column>
        <el-table-column label="狀態" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
              {{ scope.row.status === 'active' ? '正常' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">編輯</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">刪除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <el-pagination
        class="pagination"
        background
        layout="prev, pager, next, jumper, ->, total"
        :total="pagination.total"
        :page-size="pagination.limit"
        v-model:current-page="currentPage"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, Plus } from '@element-plus/icons-vue';
import { membersApi, type Member, type QueryMemberDto } from '../api/members';

const router = useRouter();

// --- Reactive Data ---
const loading = ref(true);
const members = ref<Member[]>([]);
const searchParams = reactive({ query: '' });
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
});

// --- Computed Properties ---
const currentPage = computed({
  get: () => pagination.value.page,
  set: (value) => {
    pagination.value.page = value;
    loadMembers();
  }
});


// --- API Methods ---
const loadMembers = async () => {
  try {
    loading.value = true;
    const query: QueryMemberDto = {
      search: searchParams.query || undefined,
      page: pagination.value.page,
      limit: pagination.value.limit,
    };
    
    const response = await membersApi.getMembers(query);
    members.value = response.data;
    pagination.value = response.pagination;
  } catch (error: any) {
    console.error('載入會員資料失敗:', error);
    ElMessage.error(error.response?.data?.message || '載入會員資料失敗');
  } finally {
    loading.value = false;
  }
};

// --- Lifecycle Hooks ---
onMounted(() => {
  loadMembers();
});

// --- Event Handlers ---
const handleSearch = () => {
  pagination.value.page = 1; // Reset to first page on search
  loadMembers();
};

const handleAddMember = () => {
  router.push('/members/new');
};

const handleEdit = (row: Member) => {
  router.push(`/members/edit/${row.id}`);
};

const handleDelete = async (row: Member) => {
  try {
    await ElMessageBox.confirm(`您確定要刪除會員「${row.name}」嗎？`, '警告', {
      confirmButtonText: '確定刪除',
      cancelButtonText: '取消',
      type: 'warning',
    });

    loading.value = true;
    await membersApi.deleteMember(row.id);
    ElMessage.success(`已刪除會員：${row.name}`);
    
    // 重新載入資料
    await loadMembers();
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('刪除會員失敗:', error);
      ElMessage.error(error.response?.data?.message || '刪除會員失敗');
    }
  } finally {
    loading.value = false;
  }
};

</script>

<style scoped>
.members-container {
  padding: 10px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
