<template>
  <div class="employees-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>員工管理</span>
        </div>
      </template>

      <!-- Toolbar -->
      <div class="toolbar">
        <el-form :inline="true" :model="searchParams">
          <el-form-item label="搜尋員工">
            <el-input v-model="searchParams.query" placeholder="輸入姓名、員工編號或 Email"></el-input>
          </el-form-item>
          <el-form-item label="分店">
            <el-select v-model="searchParams.branchId" placeholder="選擇分店" clearable>
              <el-option
                v-for="branch in branches"
                :key="branch.id"
                :label="branch.name"
                :value="branch.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="狀態">
            <el-select v-model="searchParams.status" placeholder="選擇狀態" clearable>
              <el-option label="在職" value="active" />
              <el-option label="停職" value="inactive" />
              <el-option label="離職" value="resigned" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :icon="Search" @click="handleSearch">搜尋</el-button>
          </el-form-item>
        </el-form>
        <el-button type="success" :icon="Plus" @click="handleAddEmployee">新增員工</el-button>
      </div>

      <!-- Employees Table -->
      <el-table :data="employees" v-loading="loading" style="width: 100%">
        <el-table-column prop="employeeNumber" label="員工編號" width="120" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="title" label="職位" width="120" />
        <el-table-column prop="phone" label="手機" width="150" />
        <el-table-column label="Email" width="200">
          <template #default="scope">
            {{ scope.row.user.email }}
          </template>
        </el-table-column>
        <el-table-column label="所屬分店" width="150">
          <template #default="scope">
            {{ scope.row.branch.name }}
          </template>
        </el-table-column>
        <el-table-column label="到職日期" width="120">
          <template #default="scope">
            {{ scope.row.hireDate ? new Date(scope.row.hireDate).toLocaleDateString() : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="最後登入" width="180">
          <template #default="scope">
            {{ scope.row.user.lastLoginAt ? new Date(scope.row.user.lastLoginAt).toLocaleDateString() : '從未登入' }}
          </template>
        </el-table-column>
        <el-table-column label="狀態" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="離職日期" width="120">
          <template #default="scope">
            {{ scope.row.resignationDate ? new Date(scope.row.resignationDate).toLocaleDateString() : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="離職原因" width="200" show-overflow-tooltip>
          <template #default="scope">
            {{ scope.row.resignationReason || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">編輯</el-button>
            <el-button
              size="small"
              type="danger"
              @click="handleResign(scope.row)"
              :disabled="scope.row.status === 'resigned'"
            >
              離職
            </el-button>
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

    <!-- 離職原因對話框 -->
    <el-dialog
      v-model="resignDialogVisible"
      title="員工離職"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="resignForm" label-width="80px">
        <el-form-item label="員工姓名">
          <el-input :value="selectedEmployee?.name" disabled />
        </el-form-item>
        <el-form-item label="離職日期">
          <el-date-picker
            v-model="resignForm.resignationDate"
            type="date"
            placeholder="選擇離職日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="離職原因" required>
          <el-input
            v-model="resignForm.resignationReason"
            type="textarea"
            :rows="4"
            placeholder="請輸入離職原因"
            maxlength="1000"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="resignDialogVisible = false">取消</el-button>
          <el-button
            type="danger"
            @click="confirmResignation"
            :loading="loading"
            :disabled="!resignForm.resignationReason.trim()"
          >
            確認離職
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, Plus } from '@element-plus/icons-vue';
import { employeesApi, branchesApi, type Employee, type QueryEmployeeDto, type Branch, type ResignEmployeeDto } from '../api/employees';

const router = useRouter();

// --- Reactive Data ---
const loading = ref(true);
const employees = ref<Employee[]>([]);
const branches = ref<Branch[]>([]);
const searchParams = reactive({
  query: '',
  branchId: '',
  status: ''
});
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
});
const resignDialogVisible = ref(false);
const selectedEmployee = ref<Employee | null>(null);
const resignForm = reactive({
  resignationReason: '',
  resignationDate: ''
});

// --- Computed Properties ---
const currentPage = computed({
  get: () => pagination.value.page,
  set: (value) => {
    pagination.value.page = value;
    loadEmployees();
  }
});

// --- Helper Functions ---
const getStatusType = (status: string) => {
  switch (status) {
    case 'active': return 'success';
    case 'inactive': return 'warning';
    case 'resigned': return 'danger';
    default: return 'info';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'active': return '在職';
    case 'inactive': return '停職';
    case 'resigned': return '離職';
    default: return status;
  }
};

// --- API Methods ---
const loadEmployees = async () => {
  try {
    loading.value = true;
    const query: QueryEmployeeDto = {
      search: searchParams.query || undefined,
      branchId: searchParams.branchId || undefined,
      status: searchParams.status || undefined,
      page: pagination.value.page,
      limit: pagination.value.limit,
    };

    const response = await employeesApi.getEmployees(query);
    employees.value = response.data;
    pagination.value = response.pagination;
  } catch (error: any) {
    console.error('載入員工資料失敗:', error);
    ElMessage.error(error.response?.data?.message || '載入員工資料失敗');
  } finally {
    loading.value = false;
  }
};

const loadBranches = async () => {
  try {
    const response = await branchesApi.getBranches();
    branches.value = response;
  } catch (error: any) {
    console.error('載入分店資料失敗:', error);
  }
};

// --- Lifecycle Hooks ---
onMounted(() => {
  loadBranches();
  loadEmployees();
});

// --- Event Handlers ---
const handleSearch = () => {
  pagination.value.page = 1;
  loadEmployees();
};

const handleAddEmployee = () => {
  router.push('/employees/new');
};

const handleEdit = (row: Employee) => {
  router.push(`/employees/edit/${row.id}`);
};

const handleResign = (row: Employee) => {
  selectedEmployee.value = row;
  resignForm.resignationReason = '';
  resignForm.resignationDate = '';
  resignDialogVisible.value = true;
};

const confirmResignation = async () => {
  if (!selectedEmployee.value || !resignForm.resignationReason.trim()) {
    ElMessage.warning('請填寫離職原因');
    return;
  }

  try {
    loading.value = true;
    const resignData: ResignEmployeeDto = {
      resignationReason: resignForm.resignationReason,
      resignationDate: resignForm.resignationDate || undefined
    };

    await employeesApi.resignEmployee(selectedEmployee.value.id, resignData);
    ElMessage.success(`員工 ${selectedEmployee.value.name} 已設為離職狀態`);

    resignDialogVisible.value = false;
    await loadEmployees();
  } catch (error: any) {
    console.error('設定員工離職失敗:', error);
    ElMessage.error(error.response?.data?.message || '設定員工離職失敗');
  } finally {
    loading.value = false;
  }
};

const handleDelete = async (row: Employee) => {
  // 舊的直接離職方法，可以保留作為後備
  try {
    await ElMessageBox.confirm(`您確定要將員工「${row.name}」設為離職狀態嗎？`, '警告', {
      confirmButtonText: '確定離職',
      cancelButtonText: '取消',
      type: 'warning',
    });

    loading.value = true;
    await employeesApi.deleteEmployee(row.id);
    ElMessage.success(`員工 ${row.name} 已設為離職狀態`);

    await loadEmployees();
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('設定員工離職失敗:', error);
      ElMessage.error(error.response?.data?.message || '設定員工離職失敗');
    }
  } finally {
    loading.value = false;
  }
};

</script>

<style scoped>
.employees-container {
  padding: 10px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>